#!/bin/bash
set -e

echo "🚀 Starting deployment to $ENV_NAME..."

# Create backup for production
if [ "$ENV_NAME" == "production" ] && [ -d "$DEPLOY_PATH" ]; then
  echo "💾 Creating backup..."
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  cp -r $DEPLOY_PATH "${DEPLOY_PATH}_backup_${TIMESTAMP}"
  ls -dt ${DEPLOY_PATH}_backup_* | tail -n +6 | xargs rm -rf 2>/dev/null || true
fi

# Create directory if not exists
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Clone or pull
if [ ! -d ".git" ]; then
  echo "📥 Cloning repository..."
  git clone -b $BRANCH https://github.com/$GITHUB_REPO.git .
else
  echo "📥 Pulling latest code..."
  git fetch origin
  git checkout $BRANCH
  git reset --hard origin/$BRANCH
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Create .env file
echo "⚙️  Creating .env file..."
cat > .env << EOF
NODE_ENV=$ENV_NAME
PORT=$PORT
API_BASE_URL=http://202.155.95.166:$PORT

DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=balkar_admin
DB_PASSWORD=$DB_PASSWORD
DB_DIALECT=postgres

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

FRONTEND_URL=http://localhost:3000

API_KEY_SECRET=$API_KEY_SECRET
JWT_SECRET=$JWT_SECRET

LOG_LEVEL=info
EOF

# Create directories
mkdir -p uploads logs

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create database if not exists
echo "🗄️  Checking database..."
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "Creating database $DB_NAME..."
  sudo -u postgres createdb $DB_NAME
  sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO balkar_admin;"
else
  echo "Database $DB_NAME already exists"
fi

# Fix database permissions
echo "🔐 Setting database permissions..."
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO balkar_admin;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO balkar_admin;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO balkar_admin;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO balkar_admin;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO balkar_admin;"

# Run migrations
if [ "$ENV_NAME" != "development" ]; then
  echo "🔄 Running migrations..."
  NODE_ENV=$ENV_NAME npm run migrate
fi

# Restart application with PM2
echo "🔄 Restarting application..."
if pm2 describe $APP_NAME > /dev/null 2>&1; then
  pm2 restart $APP_NAME
else
  pm2 start dist/server.js --name $APP_NAME
fi
pm2 save

echo "✅ Deployment to $ENV_NAME completed!"
pm2 status $APP_NAME
