# 🌿 Branch Strategy & Deployment Flow

## 📌 Branch Overview

| Branch | Environment | Auto Deploy | Port | Database | Purpose |
|--------|-------------|-------------|------|----------|---------|
| `feature/*` | - | ❌ No | - | - | Development fitur baru |
| `dev` | Development | ✅ Auto | 8002 | `balkar_bucket_dev` | Testing & development |
| `staging` | Staging | ✅ Auto | 8001 | `balkar_bucket_staging` | Pre-production testing |
| `main` | Production | ✅ Auto | 8000 | `balkar_bucket_prod` | Live production |

---

## 🔄 Deployment Flow

```
feature/new-feature → dev → staging → main
     (No Deploy)     (Auto) (Auto)   (Auto)
```

---

## 🚀 Workflow by Branch

### 1️⃣ **Feature Branches** (`feature/*`)

**Purpose:** Develop fitur baru secara isolated

**CI/CD:**
- ✅ Run tests
- ✅ Run lint
- ✅ Build check
- ❌ No deploy

**How to use:**
```bash
# Create feature branch
git checkout -b feature/upload-avatar
git push origin feature/upload-avatar

# Create PR to dev
# GitHub → Pull Requests → New PR → base: dev
```

**Best Practices:**
- Prefix: `feature/`, `bugfix/`, `hotfix/`
- Keep branch focused (1 feature = 1 branch)
- Delete after merge

---

### 2️⃣ **Development Branch** (`dev`)

**Purpose:** Integration testing & development environment

**Environment:**
- Server: `/var/www/balkar-bucket-dev`
- Port: `8002`
- Database: `balkar_bucket_dev`
- URL: `http://your-vps:8002`

**CI/CD:**
- ✅ Auto deploy on push
- ⏭️  Skip migrations (manual only)
- ✅ Full test suite

**How to use:**
```bash
# Merge feature to dev
git checkout dev
git merge feature/upload-avatar
git push origin dev
# Auto deploy akan jalan!

# Or create PR
# feature/upload-avatar → dev
```

**Best Practices:**
- Merge feature branches disini dulu
- Test integration sebelum ke staging
- Boleh ada bugs, no problem!

---

### 3️⃣ **Staging Branch** (`staging`)

**Purpose:** Pre-production testing dengan production-like environment

**Environment:**
- Server: `/var/www/balkar-bucket-staging`
- Port: `8001`
- Database: `balkar_bucket_staging`
- URL: `http://your-vps:8001`

**CI/CD:**
- ✅ Auto deploy on push
- ✅ Run migrations
- ✅ Full security audit
- ✅ Performance testing

**How to use:**
```bash
# Promote dev to staging
git checkout staging
git merge dev
git push origin staging
# Auto deploy akan jalan!

# Or create PR
# dev → staging
```

**Best Practices:**
- Harus stabil sebelum ke production
- Test dengan production data copy
- UAT (User Acceptance Testing) disini
- Final testing sebelum release

---

### 4️⃣ **Production Branch** (`main`)

**Purpose:** Live production environment

**Environment:**
- Server: `/var/www/balkar-bucket-prod`
- Port: `8000`
- Database: `balkar_bucket_prod`
- URL: `http://your-vps:8000`

**CI/CD:**
- ✅ Auto deploy on push
- ✅ Run migrations
- ✅ Auto backup before deploy
- ✅ Health monitoring
- 📢 Notifications

**How to use:**
```bash
# Promote staging to production
git checkout main
git merge staging
git push origin main
# Auto deploy akan jalan!

# Or create PR (RECOMMENDED)
# staging → main
```

**Best Practices:**
- **NEVER** push directly! Merge via PR
- Require approvals (Settings → Branches)
- Tag releases: `git tag v1.0.0`
- Monitor logs after deploy

---

## 🎯 Complete Development Cycle

### Scenario: Fitur Upload Avatar

```bash
# 1. Create feature branch
git checkout -b feature/upload-avatar
# ... koding ...
git add .
git commit -m "Add avatar upload feature"
git push origin feature/upload-avatar

# 2. Create PR: feature/upload-avatar → dev
# GitHub → Pull Requests → New PR
# Wait for CI to pass
# Merge PR

# 3. Test di dev environment
# http://your-vps:8002/api/users/avatar
# Fix bugs kalau ada

# 4. Promote to staging
git checkout staging
git merge dev
git push origin staging
# Auto deploy to staging!

# 5. Test di staging
# http://your-vps:8001/api/users/avatar
# UAT & testing

# 6. Promote to production
# Create PR: staging → main
# Get approval
# Merge PR
# Auto deploy to production!

# 7. Tag release
git tag v1.0.0
git push origin v1.0.0

# 8. Monitor production
pm2 logs balkar-bucket-prod
# Check health: http://your-vps:8000/api/health
```

---

## 🔧 Manual Deploy

Kalau butuh deploy manual (misalnya rollback):

```bash
# Via GitHub Actions
# 1. Buka GitHub → Actions
# 2. Pilih "Manual Deploy"
# 3. Run workflow:
#    - Environment: pilih (dev/staging/production)
#    - Run migrations: true/false
# 4. Klik "Run workflow"
```

---

## 🐛 Hotfix Flow

Kalau ada bug critical di production:

```bash
# 1. Create hotfix dari main
git checkout main
git checkout -b hotfix/critical-bug
# ... fix bug ...
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug

# 2. Create PR: hotfix → main
# Fast approval & merge

# 3. Backport ke branch lain
git checkout staging
git merge main

git checkout dev
git merge staging
```

---

## 📊 Branch Protection Rules

Recommended settings di GitHub:

### For `main` (Production):
- ✅ Require pull request reviews (min 1)
- ✅ Require status checks (CI must pass)
- ✅ Require branches up to date
- ✅ Restrict who can push (Admins only)

### For `staging`:
- ✅ Require pull request reviews
- ✅ Require status checks

### For `dev`:
- ✅ Require status checks
- ⚠️  Direct push allowed (untuk development)

---

## 🎨 Naming Conventions

```
feature/upload-avatar      # New feature
bugfix/fix-login-error    # Bug fix
hotfix/critical-payment   # Critical production fix
refactor/optimize-query   # Code refactoring
docs/update-readme        # Documentation
test/add-unit-tests       # Testing
```

---

## 🔍 Monitoring

```bash
# Check all environments
ssh root@your-vps

# Development
pm2 logs balkar-bucket-dev
curl http://localhost:8002/api/health

# Staging
pm2 logs balkar-bucket-staging
curl http://localhost:8001/api/health

# Production
pm2 logs balkar-bucket-prod
curl http://localhost:8000/api/health
```

---

## ✅ Checklist Before Production Deploy

- [ ] All tests passing
- [ ] Staging tested & approved
- [ ] Database migrations reviewed
- [ ] Backup verified
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitor ready
- [ ] Documentation updated

---

## 🚨 Emergency Rollback

```bash
# Via SSH
ssh root@your-vps
cd /var/www/balkar-bucket-prod

# Rollback code
git log --oneline -5
git reset --hard <commit-hash>
npm ci --production
npm run build
pm2 restart balkar-bucket-prod

# Restore database (if needed)
cd /var/backups/balkar-bucket
# Find latest backup
ls -lh balkar-bucket-prod_*.tar.gz
```

---

**Happy Deploying! 🚀**
