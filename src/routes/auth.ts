import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validator';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
router.get('/me', authenticateJWT, authController.getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticateJWT, authController.logout);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateJWT, authController.refreshToken);

export default router;
