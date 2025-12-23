import { Response } from 'express';
import { ApiKey } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, getPaginationData } from '../utils/helpers';
import { generateApiKey } from '../utils/helpers';
import { logActivity } from '../services/logService';
import { LOG_TYPES } from '../utils/constants';

export const getAllApiKeys = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: apiKeys } = await ApiKey.findAndCountAll({
      where,
      limit: queryLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: apiKeys,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getApiKeyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByPk(id);

    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    res.json(apiKey);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      permissions,
      rateLimitEnabled,
      rateLimitMax,
      rateLimitWindow,
      expiresAt,
    } = req.body;

    const key = generateApiKey();

    const apiKey = await ApiKey.create({
      name,
      key,
      permissions: permissions || ['read'],
      status: 'active',
      rateLimitEnabled: rateLimitEnabled || false,
      rateLimitMax: rateLimitMax || 1000,
      rateLimitWindow: rateLimitWindow || 60000,
      expiresAt: expiresAt || null,
      totalRequests: BigInt(0),
      totalUploads: BigInt(0),
      storageUsed: BigInt(0),
      errorCount: 0,
    });

    await logActivity(
      {
        type: LOG_TYPES.AUTH,
        action: 'api_key_created',
        details: { apiKeyId: apiKey.id, name: apiKey.name },
      },
      req
    );

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      message: 'API key created successfully. Please save the key, it will not be shown again.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissions, rateLimitMax, rateLimitEnabled } = req.body;

    const apiKey = await ApiKey.findByPk(id);

    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    await apiKey.update({
      ...(permissions && { permissions }),
      ...(rateLimitMax && { rateLimitMax }),
      ...(rateLimitEnabled !== undefined && { rateLimitEnabled }),
    });

    await logActivity(
      {
        type: LOG_TYPES.AUTH,
        action: 'api_key_updated',
        details: { apiKeyId: apiKey.id, name: apiKey.name },
      },
      req
    );

    res.json({ message: 'API key updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const revokeApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByPk(id);

    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    await apiKey.update({ status: 'revoked' });

    await logActivity(
      {
        type: LOG_TYPES.AUTH,
        action: 'api_key_revoked',
        details: { apiKeyId: apiKey.id, name: apiKey.name },
      },
      req
    );

    res.json({ message: 'API key revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
