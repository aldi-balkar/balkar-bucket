import { Router } from 'express';
import * as permissionController from '../controllers/permissionController';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// Routes
router.get(
  '/',
  authenticateApiKey,
  permissionController.getAllPermissions
);

export default router;
