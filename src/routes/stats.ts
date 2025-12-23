import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';

const router = Router();

// Routes
router.get(
  '/dashboard',
  authenticateApiKey,
  checkPermission('users.read'),
  statsController.getDashboardStats
);

export default router;
