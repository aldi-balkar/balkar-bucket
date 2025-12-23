import { Router } from 'express';
import * as apiKeyController from '../controllers/apiKeyController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';
import { validate } from '../middleware/validator';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createApiKeySchema = Joi.object({
  name: Joi.string().required().min(3).max(255),
  permissions: Joi.array().items(Joi.string()).optional(),
  rateLimitEnabled: Joi.boolean().optional(),
  rateLimitMax: Joi.number().optional(),
  rateLimitWindow: Joi.number().optional(),
  expiresAt: Joi.date().optional(),
});

const updateApiKeySchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).optional(),
  rateLimitMax: Joi.number().optional(),
  rateLimitEnabled: Joi.boolean().optional(),
});

// Routes
router.get(
  '/',
  authenticateApiKey,
  checkPermission('api-keys.read'),
  apiKeyController.getAllApiKeys
);

router.get(
  '/:id',
  authenticateApiKey,
  checkPermission('api-keys.read'),
  apiKeyController.getApiKeyById
);

router.post(
  '/',
  authenticateApiKey,
  checkPermission('api-keys.create'),
  validate(createApiKeySchema),
  apiKeyController.createApiKey
);

router.patch(
  '/:id',
  authenticateApiKey,
  checkPermission('api-keys.create'),
  validate(updateApiKeySchema),
  apiKeyController.updateApiKey
);

router.delete(
  '/:id',
  authenticateApiKey,
  checkPermission('api-keys.revoke'),
  apiKeyController.revokeApiKey
);

export default router;
