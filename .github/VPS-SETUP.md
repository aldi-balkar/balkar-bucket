# 🚀 VPS Setup & CI/CD Guide

Complete guide untuk deploy Balkar Bucket ke VPS dengan GitHub Actions CI/CD.

## 📋 Table of Contents

- [VPS Information](#-vps-information)
- [Initial Setup](#-initial-setup)
- [GitHub Secrets](#-github-secrets-configuration)
- [Create Branches](#-create-branches)
- [First Deployment](#-first-deployment)
- [Monitoring](#-monitoring)
- [Troubleshooting](#-troubleshooting)

---

## 🖥️ VPS Information

| Info | Value |
|------|-------|
| **IP Address** | `202.155.95.166` |
| **SSH Command** | `ssh root@202.155.95.166` |
| **OS** | Ubuntu 20.04/22.04 |

### 🌍 Environments

| Environment | Branch | Port | URL | Database | Path |
|-------------|--------|------|-----|----------|------|
| **Production** | `main` | 8000 | http://202.155.95.166:8000 | `balkar_bucket` | `/var/www/balkar-bucket-backend` |
| **Staging** | `staging` | 8001 | http://202.155.95.166:8001 | `balkar_bucket_staging` | `/var/www/balkar-bucket-staging` |
| **Development** | `dev` | 8002 | http://202.155.95.166:8002 | `balkar_bucket_dev` | `/var/www/balkar-bucket-dev` |

---

## 🔧 Initial Setup

### Step 1: SSH ke VPS

```bash
ssh root@202.155.95.166
```

### Step 2: Download Setup Script

```bash
cd ~
wget https://raw.githubusercontent.com/aldi-balkar/balkar-bucket/main/scripts/setup-vps-initial.sh
chmod +x setup-vps-initial.sh
```

### Step 3: Run Setup Script

```bash
# Run dengan password database custom
./setup-vps-initial.sh "YourStrongDBPassword123!"

# Or tanpa argument (akan pakai default password)
./setup-vps-initial.sh
```

**Setup script akan install:**
- ✅ PostgreSQL 14 + user `balkar_admin`
- ✅ Node.js 18 + NPM
- ✅ PM2 (process manager)
- ✅ Nginx (reverse proxy)
- ✅ UFW Firewall (configured)
- ✅ Git
- ✅ Create app directories

**Estimated time:** 5-10 minutes

### Step 4: Generate SSH Key untuk GitHub Actions

Masih di VPS, run command ini:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Add ke authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/github_actions
chmod 644 ~/.ssh/github_actions.pub
chmod 700 ~/.ssh
chmod 644 ~/.ssh/authorized_keys

# Show private key (COPY THIS!)
echo "==================== PRIVATE KEY ===================="
cat ~/.ssh/github_actions
echo "===================================================="
echo ""
echo "👆 Copy ENTIRE output (including BEGIN and END lines)"
echo "This will be used for GitHub Secret: VPS_SSH_KEY"
```

**⚠️ IMPORTANT:** Copy the ENTIRE private key output (including `-----BEGIN` and `-----END` lines)!

### Step 5: Generate API Secrets

```bash
# Generate API_KEY_SECRET
echo "==================== API_KEY_SECRET ===================="
openssl rand -hex 32
echo "========================================================"
echo ""

# Generate JWT_SECRET
echo "==================== JWT_SECRET ========================"
openssl rand -hex 32
echo "========================================================"
echo ""
echo "👆 Copy each output untuk GitHub Secrets"
```

### Step 6: Test SSH Connection

```bash
# Exit dari VPS
exit

# Test SSH dari local dengan key yang baru dibuat
ssh -i ~/.ssh/github_actions root@202.155.95.166

# Kalau berhasil connect, berarti SSH key setup sudah benar!
exit
```

---

## 🔐 GitHub Secrets Configuration

### Go to GitHub Repository Settings

```
https://github.com/aldi-balkar/balkar-bucket/settings/secrets/actions
```

Click **"New repository secret"** untuk setiap secret berikut:

### Required Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_SSH_KEY` | Private key dari step 4 | Full private key content (include BEGIN/END) |
| `DB_PASSWORD` | Password dari setup script | Database password untuk user `balkar_admin` |
| `API_KEY_SECRET` | Random hex string | From `openssl rand -hex 32` |
| `JWT_SECRET` | Random hex string | From `openssl rand -hex 32` |

### How to Add Secret:

1. Click **"New repository secret"**
2. Name: `VPS_SSH_KEY`
3. Value: Paste ENTIRE private key output
4. Click **"Add secret"**
5. Repeat untuk secrets lainnya

---

## 🌿 Create Branches

Di local repository, create branch `dev` dan `staging`:

```bash
cd /Users/macbook/Documents/Projects/balkar-bucket-beckend

# Create dev branch
git checkout -b dev
git push origin dev

# Create staging branch
git checkout -b staging
git push origin staging

# Back to main
git checkout main
```

---

## 🚀 First Deployment

### Auto Deployment via Git Push

```bash
# Make sure you're on main branch
git checkout main

# Add files jika ada changes
git add .
git commit -m "feat: Add CI/CD with VPS deployment"

# Push to trigger deployment
git push origin main
```

### What Happens:

1. ✅ GitHub Actions triggered
2. ✅ Run tests & build
3. ✅ SSH to VPS (202.155.95.166)
4. ✅ Clone/pull code
5. ✅ Install dependencies
6. ✅ Build TypeScript
7. ✅ Create database
8. ✅ Run migrations
9. ✅ Start with PM2
10. ✅ Health check

### Monitor Deployment:

Go to: https://github.com/aldi-balkar/balkar-bucket/actions

---

## 🎯 Development Workflow

### 1. Feature Development (No Deploy)

```bash
# Create feature branch
git checkout -b feature/upload-avatar
# ... code ...
git commit -m "Add: upload avatar feature"
git push origin feature/upload-avatar

# ✅ CI runs (tests only, no deploy)
```

### 2. Deploy to Development

```bash
# Merge to dev
git checkout dev
git merge feature/upload-avatar
git push origin dev

# ✅ Auto deploy to http://202.155.95.166:8002
```

### 3. Deploy to Staging

```bash
# Merge to staging
git checkout staging
git merge dev
git push origin staging

# ✅ Auto deploy to http://202.155.95.166:8001
```

### 4. Deploy to Production

```bash
# Merge to main
git checkout main
git merge staging
git push origin main

# ✅ Auto deploy to http://202.155.95.166:8000
```

---

## 🔍 Monitoring

### Check Application Status (via SSH)

```bash
ssh root@202.155.95.166

# Check PM2 status
pm2 status

# View logs
pm2 logs balkar-bucket          # Production
pm2 logs balkar-bucket-staging  # Staging
pm2 logs balkar-bucket-dev      # Development

# Monitor real-time
pm2 monit

# Restart app
pm2 restart balkar-bucket
```

### Health Checks

```bash
# Production
curl http://202.155.95.166:8000/api/health

# Staging
curl http://202.155.95.166:8001/api/health

# Development
curl http://202.155.95.166:8002/api/health
```

### Test API Endpoints

```bash
# Get stats (replace with your API key)
curl -H "X-API-Key: sk_live_dev_12345678901234567890123456789012" \
  http://202.155.95.166:8000/api/stats/dashboard

# Create bucket
curl -X POST http://202.155.95.166:8000/api/buckets \
  -H "X-API-Key: sk_live_dev_12345678901234567890123456789012" \
  -H "Content-Type: application/json" \
  -d '{"name": "test-bucket", "description": "Test bucket"}'
```

### Check Nginx

```bash
# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# Check error logs
tail -f /var/log/nginx/error.log

# Check access logs
tail -f /var/log/nginx/access.log
```

### Check PostgreSQL

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# List databases
\l

# Connect to database
\c balkar_bucket

# List tables
\dt

# Check table content
SELECT * FROM "Users" LIMIT 5;

# Exit
\q
```

---

## 🐛 Troubleshooting

### Issue: GitHub Actions - SSH Connection Failed

**Problem:** `Permission denied (publickey)`

**Solution:**
```bash
# Re-generate SSH key di VPS
ssh root@202.155.95.166

ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions

# Show private key
cat ~/.ssh/github_actions

# Update GitHub Secret: VPS_SSH_KEY dengan output di atas
```

### Issue: PM2 App Not Running

**Problem:** PM2 status shows "errored" or "stopped"

**Solution:**
```bash
ssh root@202.155.95.166

# Check logs
pm2 logs balkar-bucket --lines 50

# Check if port is in use
lsof -i :8000

# Restart app
pm2 restart balkar-bucket

# If still failing, start manually
cd /var/www/balkar-bucket-backend
npm run build
pm2 start dist/server.js --name balkar-bucket
pm2 save
```

### Issue: Database Connection Error

**Problem:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Check database exists
sudo -u postgres psql -l | grep balkar_bucket

# Recreate database if needed
sudo -u postgres psql -c "CREATE DATABASE balkar_bucket;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE balkar_bucket TO balkar_admin;"
```

### Issue: Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::8000`

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Restart PM2
pm2 restart balkar-bucket
```

### Issue: Nginx 502 Bad Gateway

**Problem:** Nginx returns 502 error

**Solution:**
```bash
# Check if Node.js app is running
pm2 status

# Check app logs
pm2 logs balkar-bucket

# Restart app
pm2 restart balkar-bucket

# Check nginx error logs
tail -f /var/log/nginx/error.log
```

### Issue: Build Failed in GitHub Actions

**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Test build locally first
npm ci
npm run build

# If successful, commit and push
git add .
git commit -m "Fix: build errors"
git push origin main
```

---

## 🔄 Manual Deployment

### Via GitHub Actions (Manual Trigger)

1. Go to: https://github.com/aldi-balkar/balkar-bucket/actions
2. Click **"Manual Deploy"**
3. Click **"Run workflow"**
4. Select:
   - Environment: `development`, `staging`, or `production`
   - Branch: target branch
   - Run migrations: `true` or `false`
5. Click **"Run workflow"**

### Via SSH (Emergency)

```bash
ssh root@202.155.95.166

# Production
cd /var/www/balkar-bucket-backend
git pull origin main
npm ci --production
npm run build
npm run migrate
pm2 restart balkar-bucket

# Staging
cd /var/www/balkar-bucket-staging
git pull origin staging
npm ci
npm run build
npm run migrate
pm2 restart balkar-bucket-staging

# Development
cd /var/www/balkar-bucket-dev
git pull origin dev
npm ci
npm run build
pm2 restart balkar-bucket-dev
```

---

## 📊 Resource Monitoring

### Check Disk Space

```bash
df -h
```

### Check Memory Usage

```bash
free -h
```

### Check CPU Usage

```bash
top
# Press 'q' to quit
```

### PM2 Monitoring

```bash
pm2 monit
```

---

## 🔒 Security Best Practices

### 1. Update System Regularly

```bash
apt update && apt upgrade -y
```

### 2. Check Firewall Status

```bash
ufw status verbose
```

### 3. Change Default Passwords

Update `.env` files dengan password yang strong.

### 4. Enable SSL (Optional, if you have domain)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d api.yourdomain.com

# Auto-renewal test
certbot renew --dry-run
```

---

## 📞 Quick Commands Reference

```bash
# SSH
ssh root@202.155.95.166

# PM2
pm2 status
pm2 logs balkar-bucket
pm2 restart balkar-bucket
pm2 monit

# Nginx
nginx -t
systemctl restart nginx
tail -f /var/log/nginx/error.log

# PostgreSQL
sudo -u postgres psql balkar_bucket

# System
df -h                # Disk space
free -h              # Memory
top                  # CPU usage
systemctl status nginx
systemctl status postgresql
```

---

## 🎉 Success Checklist

- [  ] VPS setup script completed
- [ ] SSH key generated and added to GitHub Secrets
- [ ] All 4 GitHub Secrets configured
- [ ] `dev` and `staging` branches created
- [ ] First deployment successful
- [ ] Health check returns 200 OK
- [ ] PM2 shows apps running
- [ ] Nginx configured correctly
- [ ] Database migrations completed

---

**Last Updated:** 23 Desember 2025  
**VPS IP:** 202.155.95.166  
**Repository:** https://github.com/aldi-balkar/balkar-bucket

For more help, check:
- [ACTIONS.md](.github/ACTIONS.md) - GitHub Actions documentation
- [BRANCH-STRATEGY.md](.github/BRANCH-STRATEGY.md) - Branch workflow guide
