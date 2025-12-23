import { Response } from 'express';
import { Permission } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;

    const where: any = {};
    if (category) where.category = category;

    const permissions = await Permission.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    res.json({ data: permissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
