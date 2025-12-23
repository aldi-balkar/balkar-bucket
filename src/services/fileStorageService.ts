import fs from 'fs/promises';
import path from 'path';
import config from '../config/env';

export const saveFile = async (
  file: Express.Multer.File,
  bucketId: string
): Promise<string> => {
  const uploadPath = path.join(config.UPLOAD_DIR, bucketId);
  await fs.mkdir(uploadPath, { recursive: true });
  
  const filename = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadPath, filename);
  
  await fs.writeFile(filePath, file.buffer);
  
  return filePath;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export const getFileUrl = (filePath: string): string => {
  return filePath.replace('./uploads', '/uploads');
};

export const ensureUploadDir = async (): Promise<void> => {
  await fs.mkdir(config.UPLOAD_DIR, { recursive: true });
};
