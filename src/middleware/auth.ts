import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiKey, User, Role } from '../models';
import config from '../config/env';

export interface AuthRequest extends Request {
  apiKey?: ApiKey;
  user?: any;
}

export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        error: 'API key required',
        message: 'Include X-API-Key header in your request',
      });
      return;
    }

    const key = await ApiKey.findOne({
      where: {
        key: apiKey,
        status: 'active',
      },
    });

    if (!key) {
      res.status(401).json({
        error: 'Invalid API key',
        message: 'API key is invalid, revoked, or expired',
      });
      return;
    }

    // Check expiration
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      await key.update({ status: 'expired' });
      res.status(401).json({
        error: 'API key expired',
        message: 'Your API key has expired',
      });
      return;
    }

    // Update usage
    await key.increment('totalRequests');
    await key.update({ lastUsedAt: new Date() });

    req.apiKey = key;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const apiKey = req.apiKey;

    if (!apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key not found',
      });
      return;
    }

    if (!apiKey.permissions.includes(permission) && !apiKey.permissions.includes('*')) {
      res.status(403).json({
        error: 'Permission denied',
        message: `This API key does not have '${permission}' permission`,
      });
      return;
    }

    next();
  };
};

// JWT Authentication Middleware
export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid JWT token',
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Token format must be: Bearer {token}',
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      // Get user with role
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'permissions'],
        }],
        attributes: ['id', 'name', 'email', 'avatar', 'roleId', 'status'],
      });

      if (!user) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'User not found',
        });
        return;
      }

      if (user.status !== 'active') {
        res.status(401).json({
          error: 'Account inactive',
          message: 'Your account has been deactivated',
        });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please login again',
        });
        return;
      }
      
      res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or malformed',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

// Optional JWT Authentication (doesn't fail if no token)
export const optionalJWT = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'permissions'],
        }],
        attributes: ['id', 'name', 'email', 'avatar', 'roleId', 'status'],
      });

      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch {
      // Silently fail, just continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};
