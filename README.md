# 📦 Balkar Bucket - Backend API

Backend service untuk Balkar Bucket file storage system, dibangun dengan Express.js, TypeScript, dan PostgreSQL.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize
- **File Storage**: Local File System
- **Authentication**: API Key based
- **Validation**: Joi
- **Logger**: Winston

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- Node.js v18 atau lebih tinggi
- PostgreSQL v14 atau lebih tinggi
- npm atau yarn

## ⚙️ Installation

### 1. Clone & Install Dependencies

```bash
cd balkar-bucket-beckend
npm install
```

### 2. Setup PostgreSQL Database

#### macOS (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb balkar_bucket
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb balkar_bucket
```

#### Windows:
Download dan install PostgreSQL dari [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Configure Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Server
NODE_ENV=development
PORT=8000
API_BASE_URL=http://localhost:8000

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=balkar_bucket
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_DIALECT=postgres

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
ALLOWED_MIME_TYPES=image/*,application/pdf,video/*

# CORS
FRONTEND_URL=http://localhost:3000

# Security
API_KEY_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret

# Logging
LOG_LEVEL=info
```

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Seed Initial Data (Optional)

```bash
npm run seed
```

Ini akan membuat:
- Default roles (Super Admin, Admin, Developer, User)
- Default permissions
- Default settings
- Development API Key: `sk_live_dev_12345678901234567890123456789012`

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

Server akan berjalan di `http://localhost:8000`

### Production Mode

```bash
npm run build
npm start
```

## 📡 API Endpoints

Base URL: `http://localhost:8000/api`

### Authentication

Semua endpoint memerlukan header `X-API-Key`:

```
X-API-Key: sk_live_dev_12345678901234567890123456789012
```

### Available Endpoints

#### Health Check
- `GET /api/health` - Check API status

#### Buckets
- `GET /api/buckets` - List all buckets
- `GET /api/buckets/:id` - Get bucket detail
- `POST /api/buckets` - Create new bucket
- `PUT /api/buckets/:id` - Update bucket
- `DELETE /api/buckets/:id` - Delete bucket

#### Files
- `GET /api/files` - List files (requires `?bucketId=xxx`)
- `GET /api/files/:id` - Get file detail
- `POST /api/files/upload` - Upload files
- `DELETE /api/files/:id` - Delete file (soft delete)
- `GET /api/files/:id/download` - Download file

#### API Keys
- `GET /api/api-keys` - List API keys
- `GET /api/api-keys/:id` - Get API key detail
- `POST /api/api-keys` - Create new API key
- `PATCH /api/api-keys/:id` - Update API key
- `DELETE /api/api-keys/:id` - Revoke API key

#### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user detail
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Roles
- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get role detail
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

#### Permissions
- `GET /api/permissions` - List all permissions

#### Logs
- `GET /api/logs/activity` - Get activity logs
- `GET /api/logs/uploads` - Get upload logs
- `GET /api/logs/access` - Get access logs

#### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics

#### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

## 🧪 Testing API with cURL

### Create Bucket

```bash
curl -X POST http://localhost:8000/api/buckets \
  -H "X-API-Key: sk_live_dev_12345678901234567890123456789012" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-first-bucket",
    "region": "us-east-1",
    "isPublic": false
  }'
```

### Upload File

```bash
curl -X POST http://localhost:8000/api/files/upload \
  -H "X-API-Key: sk_live_dev_12345678901234567890123456789012" \
  -F "files=@/path/to/your/file.jpg" \
  -F "bucketId=YOUR_BUCKET_ID"
```

### List Files

```bash
curl -X GET "http://localhost:8000/api/files?bucketId=YOUR_BUCKET_ID&page=1&limit=10" \
  -H "X-API-Key: sk_live_dev_12345678901234567890123456789012"
```

### Get Dashboard Stats

```bash
curl -X GET http://localhost:8000/api/stats/dashboard \
  -H "X-API-Key: sk_live_dev_12345678901234567890123456789012"
```

## 📂 Project Structure

```
balkar-bucket-beckend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Sequelize config for migrations
│   │   ├── env.ts           # Environment variables
│   │   ├── logger.ts        # Winston logger setup
│   │   └── sequelize.ts     # Sequelize connection
│   │
│   ├── controllers/         # Request handlers
│   │   ├── apiKeyController.ts
│   │   ├── bucketController.ts
│   │   ├── fileController.ts
│   │   ├── logController.ts
│   │   ├── permissionController.ts
│   │   ├── roleController.ts
│   │   ├── settingController.ts
│   │   ├── statsController.ts
│   │   └── userController.ts
│   │
│   ├── middleware/          # Express middlewares
│   │   ├── auth.ts          # API Key authentication
│   │   ├── errorHandler.ts # Global error handler
│   │   ├── logger.ts        # Request logger
│   │   ├── upload.ts        # Multer file upload
│   │   └── validator.ts     # Joi validation
│   │
│   ├── migrations/          # Database migrations
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── seeders/             # Database seeders
│   ├── services/            # Business logic
│   ├── utils/               # Helper functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── uploads/                 # File storage directory
├── logs/                    # Application logs
├── .env.example
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Tables

1. **roles** - User roles and permissions
2. **users** - User accounts
3. **buckets** - Storage buckets
4. **files** - Uploaded files
5. **api_keys** - API authentication keys
6. **permissions** - Available permissions
7. **logs** - Activity logs
8. **settings** - Application settings

## 🔒 Permissions

Available permissions:

- `buckets.create`, `buckets.read`, `buckets.update`, `buckets.delete`
- `files.upload`, `files.read`, `files.delete`
- `api-keys.create`, `api-keys.read`, `api-keys.revoke`
- `users.create`, `users.read`, `users.update`, `users.delete`
- `settings.update`

Gunakan `*` untuk full access.

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server

# Database
npm run migrate          # Run all migrations
npm run migrate:undo     # Undo last migration
npm run seed             # Run all seeders
npm run seed:undo        # Undo all seeders
```

## 🐛 Debugging

### Check Database Connection

```bash
# Connect to PostgreSQL
psql -U postgres -d balkar_bucket

# List all tables
\dt

# View table structure
\d+ buckets
```

### View Logs

Logs disimpan di folder `logs/`:
- `error.log` - Error logs
- `combined.log` - All logs

## 🚨 Common Issues

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### PostgreSQL Connection Error

Pastikan PostgreSQL sudah running:

```bash
# macOS
brew services list

# Ubuntu
sudo systemctl status postgresql
```

### Migration Errors

Reset database dan run ulang migrations:

```bash
# Drop database
dropdb balkar_bucket

# Create database
createdb balkar_bucket

# Run migrations
npm run migrate
npm run seed
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🆘 Support

Jika ada pertanyaan atau issue:
1. Check dokumentasi API di atas
2. Lihat example request/response
3. Test dengan Postman/Insomnia
4. Contact frontend team untuk sync API contract

## 📄 License

MIT

---

**Happy Coding! 🚀**
