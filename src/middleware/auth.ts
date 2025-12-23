import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models';

export interface AuthRequest extends Request {
  apiKey?: ApiKey;
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
