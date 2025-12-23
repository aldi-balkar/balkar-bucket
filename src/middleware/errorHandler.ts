import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import config from '../config/env';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    apiKey: (req as any).apiKey?.name,
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: 'File too large',
      message: `Maximum file size is ${config.MAX_FILE_SIZE} bytes`,
    });
    return;
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      error: 'Validation error',
      messages: (err as any).errors.map((e: any) => e.message),
    });
    return;
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      error: 'Duplicate entry',
      message: 'Resource already exists',
    });
    return;
  }

  // Sequelize foreign key constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      error: 'Invalid reference',
      message: 'Referenced resource does not exist',
    });
    return;
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
