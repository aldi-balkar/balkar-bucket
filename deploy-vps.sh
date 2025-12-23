#!/bin/bash

echo "🚀 Balkar Bucket - Deploy from GitHub"
echo "====================================="

# Variables - EDIT INI SEBELUM RUN!
GITHUB_REPO="https://github.com/aldi-balkar/balkar-bucket.git"
GITHUB_BRANCH="main"
APP_DIR="/var/www/balkar-bucket-backend"
DB_PASSWORD="ChangeThisPassword123!"
DOMAIN="api.yourdomain.com"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Step 1: Update system...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${BLUE}📦 Step 2: Installing PostgreSQL...${NC}"
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo -e "${BLUE}🗄️  Step 3: Creating database...${NC}"
sudo -u postgres psql <<EOF
-- Drop if exists (for fresh install)
DROP DATABASE IF EXISTS balkar_bucket;
DROP USER IF EXISTS balkar_admin;

-- Create new
CREATE DATABASE balkar_bucket;
CREATE USER balkar_admin WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE balkar_bucket TO balkar_admin;
\c balkar_bucket
GRANT ALL ON SCHEMA public TO balkar_admin;
\q
EOF

echo -e "${BLUE}📦 Step 4: Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo -e "${BLUE}📦 Step 5: Installing Git...${NC}"
sudo apt install -y git

echo -e "${BLUE}📂 Step 6: Cloning repository from GitHub...${NC}"
sudo rm -rf ${APP_DIR}
sudo mkdir -p /var/www
cd /var/www
sudo git clone ${GITHUB_REPO} balkar-bucket-backend
cd ${APP_DIR}

echo -e "${BLUE}📦 Step 7: Installing dependencies...${NC}"
npm install

echo -e "${BLUE}⚙️  Step 8: Creating .env file...${NC}"
cat > .env <<EOF
NODE_ENV=production
PORT=8000
API_BASE_URL=https://${DOMAIN}

DB_HOST=localhost
DB_PORT=5432
DB_NAME=balkar_bucket
DB_USER=balkar_admin
DB_PASSWORD=${DB_PASSWORD}
DB_DIALECT=postgres

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

FRONTEND_URL=https://yourdomain.com

API_KEY_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

LOG_LEVEL=info
EOF

echo -e "${BLUE}📁 Step 9: Creating directories...${NC}"
mkdir -p uploads logs
chmod 755 uploads logs

echo -e "${BLUE}🔨 Step 10: Building TypeScript...${NC}"
npm run build

echo -e "${BLUE}🔄 Step 11: Running migrations...${NC}"
npm run migrate

echo -e "${BLUE}🌱 Step 12: Seeding database...${NC}"
npm run seed

echo -e "${BLUE}🚀 Step 13: Installing PM2...${NC}"
sudo npm install -g pm2

echo -e "${BLUE}▶️  Step 14: Starting application with PM2...${NC}"
pm2 delete balkar-bucket 2>/dev/null || true
pm2 start dist/server.js --name balkar-bucket
pm2 save
pm2 startup

echo -e "${BLUE}🌐 Step 15: Installing Nginx...${NC}"
sudo apt install -y nginx

echo -e "${BLUE}⚙️  Step 16: Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/balkar-bucket <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias ${APP_DIR}/uploads;
        autoindex off;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/balkar-bucket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo -e "${BLUE}🔒 Step 17: Setting up firewall...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo -e "${GREEN}✅ =========================================${NC}"
echo -e "${GREEN}✅  DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}✅ =========================================${NC}"
echo ""
echo -e "${BLUE}📝 Server Info:${NC}"
echo "   - Server IP: ${SERVER_IP}"
echo "   - API URL: http://${SERVER_IP}:8000"
echo "   - Health Check: http://${SERVER_IP}:8000/api/health"
echo ""
echo -e "${BLUE}🔑 Default API Key (for testing):${NC}"
echo "   sk_live_dev_12345678901234567890123456789012"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "   - Check status: pm2 status"
echo "   - View logs: pm2 logs balkar-bucket"
echo "   - Restart: pm2 restart balkar-bucket"
echo "   - Stop: pm2 stop balkar-bucket"
echo ""
echo -e "${BLUE}🔄 Update Code:${NC}"
echo "   cd ${APP_DIR}"
echo "   git pull origin main"
echo "   npm install"
echo "   npm run build"
echo "   npm run migrate"
echo "   pm2 restart balkar-bucket"
echo ""
echo -e "${BLUE}🔒 Install SSL Certificate:${NC}"
echo "   1. Point domain DNS to: ${SERVER_IP}"
echo "   2. Wait for DNS propagation (5-30 minutes)"
echo "   3. Run: sudo apt install certbot python3-certbot-nginx"
echo "   4. Run: sudo certbot --nginx -d ${DOMAIN}"
echo ""
echo -e "${BLUE}🧪 Test API:${NC}"
echo "   curl http://${SERVER_IP}:8000/api/health"
echo ""
echo -e "${GREEN}🎉 Your backend is now live!${NC}"
