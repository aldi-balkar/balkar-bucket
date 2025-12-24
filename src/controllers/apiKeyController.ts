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

    // Format data for frontend
    const formattedData = apiKeys.map((apiKey: any) => ({
      id: apiKey.id,
      name: apiKey.name,
      key: `${apiKey.key.substring(0, 15)}...${apiKey.key.substring(apiKey.key.length - 4)}`, // Masked key
      app: apiKey.name, // Using name as app
      status: apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1), // Capitalize
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimitEnabled 
        ? `${apiKey.rateLimitMax} req/min` 
        : 'Unlimited',
      usage: {
        requests: Number(apiKey.totalRequests),
        uploads: Number(apiKey.totalUploads),
        storage: formatBytes(Number(apiKey.storageUsed)),
        errors: apiKey.errorCount,
      },
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
    }));

    res.json({
      data: formattedData,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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
      app,
      permissions,
      rateLimitEnabled,
      rateLimitMax,
      rateLimitWindow,
      expiresAt,
    } = req.body;

    const key = generateApiKey();

    const apiKey = await ApiKey.create({
      name: name || app || 'Unnamed API Key',
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
      key: apiKey.key, // Full key on creation only
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
