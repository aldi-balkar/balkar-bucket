import dotenv from 'dotenv';

dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'balkar_bucket',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DIALECT: process.env.DB_DIALECT || 'postgres',
  
  // File Storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
  ALLOWED_MIME_TYPES: process.env.ALLOWED_MIME_TYPES || 'image/*,application/pdf,video/*',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Security
  API_KEY_SECRET: process.env.API_KEY_SECRET || 'your-secret-key-here',
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
