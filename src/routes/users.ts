import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';
import { validate } from '../middleware/validator';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createUserSchema = Joi.object({
  name: Joi.string().required().min(3).max(255),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  roleId: Joi.string().uuid().optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  roleId: Joi.string().uuid().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  avatar: Joi.string().uri().optional(),
});

// Routes
router.get(
  '/',
  authenticateApiKey,
  checkPermission('users.read'),
  userController.getAllUsers
);

router.get(
  '/:id',
  authenticateApiKey,
  checkPermission('users.read'),
  userController.getUserById
);

router.post(
  '/',
  authenticateApiKey,
  checkPermission('users.create'),
  validate(createUserSchema),
  userController.createUser
);

router.put(
  '/:id',
  authenticateApiKey,
  checkPermission('users.update'),
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  authenticateApiKey,
  checkPermission('users.delete'),
  userController.deleteUser
);

export default router;
