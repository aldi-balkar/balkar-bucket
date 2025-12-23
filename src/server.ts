import app from './app';
import config from './config/env';
import logger from './config/logger';
import { sequelize } from './models';
import { ensureUploadDir } from './services/fileStorageService';
import fs from 'fs';
import path from 'path';

const PORT = config.PORT;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Test database connection
const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✓ Database connection established successfully');
    
    // Sync models in development (be careful in production!)
    if (config.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      logger.info('✓ Database models synced');
    }
  } catch (error: any) {
    logger.error('✗ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Ensure upload directory exists
    await ensureUploadDir();
    logger.info('✓ Upload directory ready');

    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║      🚀 Balkar Bucket Backend is running!        ║
║                                                   ║
║      Environment: ${config.NODE_ENV.padEnd(32)}║
║      Port: ${PORT.toString().padEnd(39)}║
║      URL: http://localhost:${PORT.toString().padEnd(26)}║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error: any) {
    logger.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();
