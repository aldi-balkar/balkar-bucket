import { Response } from 'express';
import { File, Bucket, ApiKey } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, getPaginationData } from '../utils/helpers';
import { logActivity } from '../services/logService';
import { LOG_TYPES } from '../utils/constants';
import { Op } from 'sequelize';
import fs from 'fs';

export const getAllFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const bucketId = req.query.bucketId as string;
    const search = req.query.search as string;
    const isDeleted = req.query.isDeleted === 'true';

    if (!bucketId) {
      res.status(400).json({ error: 'Bucket ID is required' });
      return;
    }

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const where: any = {
      bucketId,
      isDeleted,
    };

    if (search) {
      where.originalName = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { count, rows: files } = await File.findAndCountAll({
      where,
      limit: queryLimit,
      offset,
      include: [
        {
          model: Bucket,
          as: 'bucket',
          attributes: ['id', 'name'],
        },
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: files,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFileById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [
        {
          model: Bucket,
          as: 'bucket',
          attributes: ['id', 'name'],
        },
        {
          model: ApiKey,
          as: 'apiKey',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bucketId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    if (!bucketId) {
      res.status(400).json({ error: 'Bucket ID is required' });
      return;
    }

    const bucket = await Bucket.findByPk(bucketId);

    if (!bucket) {
      res.status(404).json({ error: 'Bucket not found' });
      return;
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileUrl = `/uploads/${bucketId}/${file.filename}`;

      const newFile = await File.create({
        filename: file.filename,
        originalName: file.originalname,
        bucketId,
        size: BigInt(file.size),
        mimeType: file.mimetype,
        filePath: file.path,
        url: fileUrl,
        uploadedBy: req.apiKey?.name,
        apiKeyId: req.apiKey?.id,
      });

      // Update bucket statistics
      await bucket.increment('fileCount');
      await bucket.increment('usedSpace', { by: file.size });

      // Update API key statistics
      if (req.apiKey) {
        await req.apiKey.increment('totalUploads');
        await req.apiKey.increment('storageUsed', { by: file.size });
      }

      uploadedFiles.push({
        id: newFile.id,
        filename: newFile.filename,
        originalName: newFile.originalName,
        size: newFile.size,
        url: newFile.url,
      });
    }

    await logActivity(
      {
        type: LOG_TYPES.UPLOAD,
        action: 'file_uploaded',
        details: { 
          bucketId, 
          fileCount: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0)
        },
      },
      req
    );

    res.status(201).json({
      uploaded: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [{ model: Bucket, as: 'bucket' }],
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Soft delete
    await file.update({
      isDeleted: true,
      deletedAt: new Date(),
    });

    // Update bucket statistics
    const bucket = await Bucket.findByPk(file.bucketId);
    if (bucket) {
      await bucket.decrement('fileCount');
      await bucket.decrement('usedSpace', { by: Number(file.size) });
    }

    await logActivity(
      {
        type: LOG_TYPES.DELETE,
        action: 'file_deleted',
        details: { 
          fileId: file.id,
          filename: file.originalName,
          bucketId: file.bucketId
        },
      },
      req
    );

    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (file.isDeleted) {
      res.status(410).json({ error: 'File has been deleted' });
      return;
    }

    if (!fs.existsSync(file.filePath)) {
      res.status(404).json({ error: 'File not found on storage' });
      return;
    }

    await logActivity(
      {
        type: LOG_TYPES.ACCESS,
        action: 'file_downloaded',
        details: { 
          fileId: file.id,
          filename: file.originalName
        },
      },
      req
    );

    res.download(file.filePath, file.originalName);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
