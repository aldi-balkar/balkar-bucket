import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '../models';
import { AuthRequest } from '../middleware/auth';
import config from '../config/env';
import logger from '../config/logger';

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
      return;
    }

    // Find user with role
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'permissions'],
      }],
    });

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      res.status(401).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated',
      });
      return;
    }

    // Check password
    if (!user.password) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Password not set for this user',
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    logger.info(`User logged in: ${user.email}`);

    const userRole = user.get('role') as any;

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: userRole ? {
          id: userRole.id,
          name: userRole.name,
          permissions: userRole.permissions,
        } : null,
      },
      message: 'Login successful',
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login',
    });
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'permissions'],
      }],
      attributes: ['id', 'name', 'email', 'avatar', 'roleId', 'status', 'lastLoginAt', 'createdAt'],
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
      return;
    }

    const userRole = user.get('role') as any;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: userRole ? {
        id: userRole.id,
        name: userRole.name,
        permissions: userRole.permissions,
      } : null,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching user data',
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In a stateless JWT setup, logout is handled client-side by removing the token
    // Here we can log the action
    if (req.user) {
      logger.info(`User logged out: ${req.user.email}`);
    }

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during logout',
    });
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'permissions'],
      }],
    });

    if (!user || user.status !== 'active') {
      res.status(401).json({
        error: 'Invalid token',
        message: 'User not found or inactive',
      });
      return;
    }

    // Generate new JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while refreshing token',
    });
  }
};
