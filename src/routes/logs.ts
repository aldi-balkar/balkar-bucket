import { Router } from 'express';
import * as logController from '../controllers/logController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';

const router = Router();

// Routes
router.get(
  '/activity',
  authenticateApiKey,
  checkPermission('users.read'),
  logController.getActivityLogs
);

router.get(
  '/uploads',
  authenticateApiKey,
  checkPermission('users.read'),
  logController.getUploadLogs
);

router.get(
  '/access',
  authenticateApiKey,
  checkPermission('users.read'),
  logController.getAccessLogs
);

export default router;
