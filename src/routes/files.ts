import { Router } from 'express';
import * as fileController from '../controllers/fileController';
import { authenticateApiKey, checkPermission } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Routes
router.get(
  '/',
  authenticateApiKey,
  checkPermission('files.read'),
  fileController.getAllFiles
);

router.get(
  '/:id',
  authenticateApiKey,
  checkPermission('files.read'),
  fileController.getFileById
);

router.post(
  '/upload',
  authenticateApiKey,
  checkPermission('files.upload'),
  upload.array('files', 10),
  fileController.uploadFiles
);

router.delete(
  '/:id',
  authenticateApiKey,
  checkPermission('files.delete'),
  fileController.deleteFile
);

router.get(
  '/:id/download',
  authenticateApiKey,
  checkPermission('files.read'),
  fileController.downloadFile
);

export default router;
