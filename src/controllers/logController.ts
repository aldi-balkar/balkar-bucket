import { Response } from 'express';
import { Log, ApiKey } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, getPaginationData } from '../utils/helpers';
import { Op } from 'sequelize';

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const where: any = {};
    
    if (type) where.type = type;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: logs } = await Log.findAndCountAll({
      where,
      limit: queryLimit,
      offset,
      include: [
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: logs,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUploadLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const { count, rows: logs } = await Log.findAndCountAll({
      where: {
        type: 'upload',
      },
      limit: queryLimit,
      offset,
      include: [
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: logs,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAccessLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const { count, rows: logs } = await Log.findAndCountAll({
      where: {
        type: 'access',
      },
      limit: queryLimit,
      offset,
      include: [
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: logs,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
