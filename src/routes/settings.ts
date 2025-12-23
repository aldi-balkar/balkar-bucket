import { Router } from 'express';
import * as settingController from '../controllers/settingController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';

const router = Router();

// Routes
router.get(
  '/',
  authenticateApiKey,
  checkPermission('settings.update'),
  settingController.getAllSettings
);

router.put(
  '/',
  authenticateApiKey,
  checkPermission('settings.update'),
  settingController.updateSettings
);

export default router;
