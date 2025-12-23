import { Router } from 'express';
import * as roleController from '../controllers/roleController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';
import { validate } from '../middleware/validator';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

// Routes
router.get(
  '/',
  authenticateApiKey,
  roleController.getAllRoles
);

router.get(
  '/:id',
  authenticateApiKey,
  roleController.getRoleById
);

router.post(
  '/',
  authenticateApiKey,
  checkPermission('users.create'),
  validate(createRoleSchema),
  roleController.createRole
);

router.put(
  '/:id',
  authenticateApiKey,
  checkPermission('users.update'),
  validate(updateRoleSchema),
  roleController.updateRole
);

router.delete(
  '/:id',
  authenticateApiKey,
  checkPermission('users.delete'),
  roleController.deleteRole
);

export default router;
