import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/env';

const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    const bucketId = req.body.bucketId;
    if (!bucketId) {
      return cb(new Error('Bucket ID is required'), '');
    }

    const uploadPath = path.join(config.UPLOAD_DIR, bucketId);

    try {
      // Create directory if not exists
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error: any) {
      cb(error, '');
    }
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const maxSize = config.MAX_FILE_SIZE;

  if (file.size > maxSize) {
    return cb(new Error('File too large'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
});

export default upload;
