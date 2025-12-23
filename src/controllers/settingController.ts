import { Response } from 'express';
import { Setting } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await Setting.findAll();

    const settingsObject: any = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    res.json(settingsObject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await Setting.upsert({
        key,
        value: value as object,
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
