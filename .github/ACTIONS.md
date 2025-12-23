# 🚀 GitHub Actions CI/CD Setup

## 📋 Available Workflows

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
Otomatis jalan ketika push/PR ke branch `main`, `staging`, `dev`, atau `feature/*`.

**Pipeline Steps:**
- 🔍 **Lint**: Code quality check
- 🔨 **Build**: Compile TypeScript
- 🧪 **Test**: Run tests dengan PostgreSQL
- 🔒 **Security**: NPM audit
- 🚀 **Deploy**: Auto deploy berdasarkan branch
- 📢 **Notify**: Kirim notifikasi status

**Auto Deploy:**
- `main` → Production (port 8000)
- `staging` → Staging (port 8001)
- `dev` → Development (port 8002)
- `feature/*` → No deploy (CI only)

**Trigger:**
```bash
# Auto deploy to dev
git push origin dev

# Auto deploy to staging
git push origin staging

# Auto deploy to production
git push origin main

# CI only (no deploy)
git push origin feature/new-feature
```

---

### 2. **Manual Deploy** (`.github/workflows/manual-deploy.yml`)
Deploy manual dengan kontrol penuh ke 4 environments.

**Cara Pakai:**
1. Buka GitHub repo → **Actions** tab
2. Pilih **"Manual Deploy"**
3. Klik **"Run workflow"**
4. Pilih options:
   - Environment: `development`, `staging`, atau `production`
   - Run migrations: `true` atau `false`
5. Klik **"Run workflow"**

**Environment Details:**
- **Development**: Branch `dev`, Port 8002, DB `balkar_bucket_dev`
- **Staging**: Branch `staging`, Port 8001, DB `balkar_bucket_staging`
- **Production**: Branch `main`, Port 8000, DB `balkar_bucket_prod`

**Features:**
- ✅ Pilih environment (3 options)
- ✅ Toggle migrations
- ✅ Auto backup sebelum deploy
- ✅ Keep last 5 backups
- ✅ Detailed summary dengan port & database info

---

### 3. **Health Check** (`.github/workflows/health-check.yml`)
Monitor API health secara otomatis.

**Schedule:** Setiap 30 menit  
**Endpoint:** `/api/health`

**Cara Pakai:**
- Otomatis jalan setiap 30 menit
- Atau manual: Actions → Health Check → Run workflow

**Akan notify kalau:**
- ❌ API down (HTTP != 200)
- ❌ Server tidak respond
- ❌ Health endpoint error

---

## ⚙️ Setup GitHub Secrets

Sebelum workflows jalan, setup secrets dulu:

### 1. Buka GitHub Repo
```
Repository → Settings → Secrets and variables → Actions
```

### 2. Tambah Secrets Berikut:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | IP atau domain VPS | `123.45.67.89` atau `api.balkar.com` |
| `VPS_USER` | Username SSH | `root` atau `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key | Copy dari `~/.ssh/id_rsa` |
| `VPS_PORT` | SSH port (optional) | `22` (default) |

---

## 🔑 Setup SSH Key untuk VPS

### Di Komputer Lokal:

```bash
# 1. Generate SSH key (kalau belum punya)
ssh-keygen -t ed25519 -C "github-actions"
# Save di: ~/.ssh/github_actions
# Tekan Enter untuk no passphrase

# 2. Copy public key ke VPS
ssh-copy-id -i ~/.ssh/github_actions.pub root@your-vps-ip

# 3. Test koneksi
ssh -i ~/.ssh/github_actions root@your-vps-ip

# 4. Copy PRIVATE key content
cat ~/.ssh/github_actions
# Copy semua output (termasuk BEGIN dan END)
```

### Di GitHub:

1. Buka **Settings → Secrets → New repository secret**
2. Name: `VPS_SSH_KEY`
3. Value: Paste **private key** dari step 4
4. Klik **Add secret**

---

## 🧪 Test Workflows

### Test CI/CD Pipeline:
```bash
# Di lokal
git add .
git commit -m "Test CI/CD pipeline"
git push origin main

# Check di GitHub
# Repository → Actions → CI/CD Pipeline
```

### Test Manual Deploy:
1. Buka **Actions** tab
2. Pilih **Manual Deploy**
3. Klik **Run workflow**
4. Pilih options → Run

### Test Health Check:
1. Buka **Actions** tab
## 📊 Pipeline Flow

```mermaid
graph TB
    A[Push Code] --> B{Which Branch?}
    B -->|feature/*| C[CI Only]
    B -->|dev| D[CI + Deploy Dev]
    B -->|staging| E[CI + Deploy Staging]
    B -->|main| F[CI + Deploy Prod]
    
    C --> G[Lint + Build + Test]
    D --> G
    E --> G
    F --> G
    
    G --> H{Tests Pass?}
    H -->|Yes| I[Deploy]
    H -->|No| J[❌ Failed]
    
    I --> K[✅ Success]
``` B --> E[Security]
## 🔄 Auto Deploy Flow

```
feature/* → No Deploy (CI only)
    ↓
   dev → Deploy to Development (port 8002)
    ↓
staging → Deploy to Staging (port 8001)
## 📝 Deployment Strategy

### Branch Strategy:
- **feature/\***: Feature development (CI only, no deploy)
- **dev**: Development environment (auto deploy to port 8002)
- **staging**: Pre-production (auto deploy to port 8001)
- **main**: Production (auto deploy to port 8000)

### Environment Details:
| Environment | Branch | Port | Database | Auto Deploy |
|-------------|--------|------|----------|-------------|
| Development | `dev` | 8002 | `balkar_bucket_dev` | ✅ Yes |
| Staging | `staging` | 8001 | `balkar_bucket_staging` | ✅ Yes |
| Production | `main` | 8000 | `balkar_bucket_prod` | ✅ Yes |
| Feature | `feature/*` | - | - | ❌ No |

### Manual Deploy Options:
```
1. Development: Code only (skip migrations)
2. Staging: Code + Migrations
3. Production: Code + Migrations + Backup
```

**See detailed branch strategy:** [BRANCH-STRATEGY.md](.github/BRANCH-STRATEGY.md)

## 📝 Deployment Strategy

### Branch Strategy:
- **main**: Production (auto deploy)
- **develop**: Staging (CI only, no deploy)
- **feature/***: Feature branches (CI only)

### Manual Deploy Options:
```
1. Full Deploy: Code + Migrations
2. Code Only: Skip migrations
3. Rollback: Revert to backup
```

---

## 🐛 Troubleshooting

### Pipeline Fails at Deploy:
```bash
# Check SSH connection
ssh -i ~/.ssh/github_actions root@your-vps-ip

# Check VPS secrets
echo ${{ secrets.VPS_HOST }}
```

### Build Fails:
```bash
# Check locally first
npm ci
npm run build
```

### Health Check Fails:
```bash
# Test health endpoint
curl http://your-vps-ip:8000/api/health

# Check PM2
ssh root@your-vps-ip
pm2 status
pm2 logs balkar-bucket
```

---

## 📈 Future Enhancements

- [ ] Add Docker support
- [ ] Add staging environment
- [ ] Integrate Slack notifications
- [ ] Add performance testing
- [ ] Add database backup before deploy
- [ ] Add rollback workflow
- [ ] Add blue-green deployment

---

## 🎯 Quick Commands

```bash
# Force trigger CI
git commit --allow-empty -m "Trigger CI"
git push origin main

# Manual deploy via Actions UI
# GitHub → Actions → Manual Deploy → Run workflow

# Check deployment logs
ssh root@your-vps-ip
pm2 logs balkar-bucket --lines 100
```

---

## ✅ Checklist

- [ ] Setup GitHub secrets
- [ ] Generate & add SSH key
- [ ] Test SSH connection from local
- [ ] Push code to trigger CI
- [ ] Verify build passes
- [ ] Test manual deploy
- [ ] Check health check runs
- [ ] Monitor PM2 status on VPS

---

**Need Help?** Check workflow logs di GitHub Actions tab! 🚀
