# 🚀 Quick Start Guide - Balkar Bucket Backend

## Langkah-langkah Running Backend

### 1. Pastikan Dependencies Terinstall
```bash
cd /Users/macbook/Documents/Projects/balkar-bucket-beckend
npm install
```

### 2. Build TypeScript
```bash
npm run build
```

### 3. Jalankan Database Migrations
```bash
npm run migrate
```

### 4. Seed Database dengan Data Default
```bash
npm run seed
```

### 5. Start Backend Server
```bash
# Development mode (dengan hot reload)
npm run dev

# ATAU Production mode
npm start
```

Backend akan running di: **http://localhost:8000**

## 🧪 Test Backend

### Test 1: Health Check
```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@balkar.com","password":"admin123"}'
```

Expected:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@balkar.com",
    "role": {...}
  },
  "message": "Login successful"
}
```

### Test 3: Dashboard Stats (dengan API Key dari seed)
```bash
curl http://localhost:8000/api/stats/dashboard \
  -H 'X-API-Key: sk_live_dev_12345678901234567890123456789012'
```

## 📋 Default Credentials

**Admin User:**
- Email: `admin@balkar.com`
- Password: `admin123`

**Default API Key:**
```
sk_live_dev_12345678901234567890123456789012
```

## 🔗 Connect dengan Frontend

Frontend sudah dikonfigurasi untuk hit:
```
http://localhost:8000/api
```

Pastikan:
1. Backend running di port **8000** ✅
2. Frontend running di port **3001** ✅
3. CORS sudah dikonfigurasi untuk port 3001 ✅

## 🎯 Available Endpoints

### Authentication (JWT)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Dashboard (API Key)
- `GET /api/stats/dashboard` - Dashboard statistics

### API Keys (JWT)
- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Create API key
- `GET /api/api-keys/:id` - Get details
- `PATCH /api/api-keys/:id` - Update
- `DELETE /api/api-keys/:id` - Revoke

### Buckets (API Key)
- `GET /api/buckets` - List buckets
- `POST /api/buckets` - Create bucket
- `GET /api/buckets/:id` - Get details
- `PUT /api/buckets/:id` - Update
- `DELETE /api/buckets/:id` - Delete

### Files (API Key)
- `GET /api/files?bucketId=xxx` - List files
- `POST /api/files/upload` - Upload files
- `GET /api/files/:id` - Get details
- `GET /api/files/:id/download` - Download
- `DELETE /api/files/:id` - Delete

### Users (JWT)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get details
- `PUT /api/users/:id` - Update
- `DELETE /api/users/:id` - Delete

## ⚡ Tips

### Development Mode
Gunakan `npm run dev` untuk auto-reload saat coding:
```bash
npm run dev
```

### Production Mode
Build dulu, baru start:
```bash
npm run build
npm start
```

### View Logs
Logs tersimpan di folder `logs/`:
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

### Restart PM2 (Production)
```bash
pm2 restart balkar-bucket
pm2 logs balkar-bucket
```

## 🐛 Common Issues

### Issue: Port 8000 already in use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Issue: Database connection error
Check `.env` file:
```env
DB_HOST=202.155.95.166
DB_PORT=5432
DB_NAME=app_db
DB_USER=app_user
DB_PASSWORD=Buana200897!
```

### Issue: "User not found" saat login
Seed database:
```bash
npm run seed
```

## ✅ Checklist Sebelum Testing dengan Frontend

- [ ] Backend running di http://localhost:8000
- [ ] Health check sukses: `curl http://localhost:8000/api/health`
- [ ] Login berhasil dengan admin@balkar.com
- [ ] Dashboard stats bisa diakses dengan API key
- [ ] Frontend running di http://localhost:3001
- [ ] Browser console tidak ada CORS error

## 🎉 Ready!

Backend sudah siap digunakan oleh frontend! 🚀
