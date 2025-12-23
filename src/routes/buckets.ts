import { Router } from 'express';
import * as bucketController from '../controllers/bucketController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';
import { validate } from '../middleware/validator';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createBucketSchema = Joi.object({
  name: Joi.string().required().min(3).max(63),
  region: Joi.string().optional(),
  isPublic: Joi.boolean().optional(),
  quota: Joi.number().optional(),
});

const updateBucketSchema = Joi.object({
  isPublic: Joi.boolean().optional(),
  quota: Joi.number().optional(),
});

// Routes
router.get(
  '/',
  authenticateApiKey,
  checkPermission('buckets.read'),
  bucketController.getAllBuckets
);

router.get(
  '/:id',
  authenticateApiKey,
  checkPermission('buckets.read'),
  bucketController.getBucketById
);

router.post(
  '/',
  authenticateApiKey,
  checkPermission('buckets.create'),
  validate(createBucketSchema),
  bucketController.createBucket
);

router.put(
  '/:id',
  authenticateApiKey,
  checkPermission('buckets.update'),
  validate(updateBucketSchema),
  bucketController.updateBucket
);

router.delete(
  '/:id',
  authenticateApiKey,
  checkPermission('buckets.delete'),
  bucketController.deleteBucket
);

export default router;
