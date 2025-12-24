import { Router } from 'express';
import authRouter from './auth';
import bucketsRouter from './buckets';
import filesRouter from './files';
import apiKeysRouter from './apiKeys';
import usersRouter from './users';
import rolesRouter from './roles';
import permissionsRouter from './permissions';
import logsRouter from './logs';
import statsRouter from './stats';
import settingsRouter from './settings';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
router.use('/auth', authRouter);
router.use('/buckets', bucketsRouter);
router.use('/files', filesRouter);
router.use('/api-keys', apiKeysRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/permissions', permissionsRouter);
router.use('/logs', logsRouter);
router.use('/stats', statsRouter);
router.use('/settings', settingsRouter);

export default router;
