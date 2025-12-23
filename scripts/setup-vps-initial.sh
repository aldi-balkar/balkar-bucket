#!/bin/bash

# ============================================
# Balkar Bucket - Initial VPS Setup
# Run this ONCE on fresh VPS: 202.155.95.166
# Usage: ./setup-vps-initial.sh "YourDBPassword"
# ============================================

set -e

echo "🚀 Balkar Bucket - Initial VPS Setup"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
DB_PASSWORD="${1:-ChangeThisPassword123!}"

if [ "$1" == "" ]; then
  echo -e "${YELLOW}⚠️  No password provided, using default: ChangeThisPassword123!${NC}"
  echo -e "${YELLOW}⚠️  Run with: ./setup-vps-initial.sh 'YourStrongPassword'${NC}"
  echo ""
fi

echo -e "${BLUE}📦 Step 1: Update system...${NC}"
apt update && apt upgrade -y

echo -e "${BLUE}📦 Step 2: Install PostgreSQL 14...${NC}"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

echo -e "${BLUE}🗄️  Step 3: Create PostgreSQL user...${NC}"
sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'balkar_admin') THEN
    CREATE USER balkar_admin WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
    ALTER USER balkar_admin CREATEDB;
  END IF;
END
\$\$;
EOF

echo -e "${GREEN}✅ PostgreSQL user 'balkar_admin' created${NC}"

echo -e "${BLUE}📦 Step 4: Install Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo -e "${GREEN}✅ Node.js $(node -v) installed${NC}"
echo -e "${GREEN}✅ NPM $(npm -v) installed${NC}"

echo -e "${BLUE}📦 Step 5: Install Git...${NC}"
apt install -y git

echo -e "${BLUE}📦 Step 6: Install PM2...${NC}"
npm install -g pm2
pm2 startup

echo -e "${BLUE}📦 Step 7: Install Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${BLUE}⚙️  Step 8: Configure Nginx for 3 environments...${NC}"

# Remove default config
rm -f /etc/nginx/sites-enabled/default

# Production (port 80 → 8000)
cat > /etc/nginx/sites-available/balkar-prod <<'EOF'
server {
    listen 80 default_server;
    server_name 202.155.95.166;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /var/www/balkar-bucket-backend/uploads;
        autoindex off;
    }
}
EOF

# Staging (port 8001)
cat > /etc/nginx/sites-available/balkar-staging <<'EOF'
server {
    listen 8001;
    server_name 202.155.95.166;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/balkar-bucket-staging/uploads;
        autoindex off;
    }
}
EOF

# Development (port 8002)
cat > /etc/nginx/sites-available/balkar-dev <<'EOF'
server {
    listen 8002;
    server_name 202.155.95.166;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/balkar-bucket-dev/uploads;
        autoindex off;
    }
}
EOF

# Enable sites
ln -sf /etc/nginx/sites-available/balkar-prod /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/balkar-staging /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/balkar-dev /etc/nginx/sites-enabled/

# Test and reload
nginx -t
systemctl reload nginx

echo -e "${GREEN}✅ Nginx configured for 3 environments${NC}"

echo -e "${BLUE}🔒 Step 9: Configure firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp
ufw allow 8001/tcp
ufw allow 8002/tcp
ufw --force enable

echo -e "${GREEN}✅ Firewall configured${NC}"

echo -e "${BLUE}📁 Step 10: Create app directories...${NC}"
mkdir -p /var/www/balkar-bucket-backend
mkdir -p /var/www/balkar-bucket-staging
mkdir -p /var/www/balkar-bucket-dev
mkdir -p /var/backups/balkar-bucket

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅  INITIAL VPS SETUP COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}📝 System Information:${NC}"
echo "   - OS: $(lsb_release -d | cut -f2)"
echo "   - Node.js: $(node -v)"
echo "   - NPM: $(npm -v)"
echo "   - PM2: $(pm2 -v)"
echo "   - PostgreSQL: $(sudo -u postgres psql --version | awk '{print $3}')"
echo "   - Nginx: $(nginx -v 2>&1 | awk '{print $3}')"
echo ""
echo -e "${BLUE}🌍 Environments Ready:${NC}"
echo "   - Production:  http://202.155.95.166:8000 (port 80 → 8000)"
echo "   - Staging:     http://202.155.95.166:8001"
echo "   - Development: http://202.155.95.166:8002"
echo ""
echo -e "${BLUE}🔐 Database Credentials:${NC}"
echo "   - Host: localhost"
echo "   - Port: 5432"
echo "   - User: balkar_admin"
echo "   - Password: ${DB_PASSWORD}"
echo ""
echo -e "${BLUE}📂 Deployment Paths:${NC}"
echo "   - Production:  /var/www/balkar-bucket-backend"
echo "   - Staging:     /var/www/balkar-bucket-staging"
echo "   - Development: /var/www/balkar-bucket-dev"
echo ""
echo -e "${YELLOW}🔑 Next Steps - Setup GitHub Secrets:${NC}"
echo ""
echo "1️⃣  Generate SSH key untuk GitHub Actions:"
echo "    ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/github_actions -N ''"
echo "    cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys"
echo "    cat ~/.ssh/github_actions"
echo "    👆 Copy private key output untuk GitHub Secret: VPS_SSH_KEY"
echo ""
echo "2️⃣  Generate API secrets:"
echo "    openssl rand -hex 32"
echo "    👆 Copy output untuk GitHub Secret: API_KEY_SECRET"
echo ""
echo "    openssl rand -hex 32"
echo "    👆 Copy output untuk GitHub Secret: JWT_SECRET"
echo ""
echo "3️⃣  Add secrets di GitHub:"
echo "    https://github.com/aldi-balkar/balkar-bucket/settings/secrets/actions"
echo ""
echo "    Required secrets:"
echo "    - VPS_SSH_KEY      (dari step 1)"
echo "    - DB_PASSWORD      (${DB_PASSWORD})"
echo "    - API_KEY_SECRET   (dari step 2)"
echo "    - JWT_SECRET       (dari step 2)"
echo ""
echo "4️⃣  Create branches & push:"
echo "    git checkout -b dev && git push origin dev"
echo "    git checkout -b staging && git push origin staging"
echo "    git checkout main && git push origin main"
echo ""
echo -e "${GREEN}🎉 VPS siap untuk CI/CD deployment!${NC}"
echo ""
