import { Response } from 'express';
import { Bucket, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, getPaginationData } from '../utils/helpers';
import { logActivity } from '../services/logService';
import { LOG_TYPES } from '../utils/constants';

export const getAllBuckets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const { count, rows: buckets } = await Bucket.findAndCountAll({
      limit: queryLimit,
      offset,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: buckets,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBucketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bucket = await Bucket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!bucket) {
      res.status(404).json({ error: 'Bucket not found' });
      return;
    }

    res.json(bucket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBucket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, region, isPublic, quota } = req.body;

    const bucket = await Bucket.create({
      name,
      region: region || 'us-east-1',
      isPublic: isPublic || false,
      quota: quota || null,
      storageClass: 'STANDARD',
      usedSpace: BigInt(0),
      fileCount: 0,
    });

    await logActivity(
      {
        type: LOG_TYPES.BUCKET,
        action: 'bucket_created',
        details: { bucketId: bucket.id, name: bucket.name },
      },
      req
    );

    res.status(201).json({
      id: bucket.id,
      name: bucket.name,
      message: 'Bucket created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBucket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPublic, quota } = req.body;

    const bucket = await Bucket.findByPk(id);

    if (!bucket) {
      res.status(404).json({ error: 'Bucket not found' });
      return;
    }

    await bucket.update({
      ...(isPublic !== undefined && { isPublic }),
      ...(quota !== undefined && { quota }),
    });

    await logActivity(
      {
        type: LOG_TYPES.BUCKET,
        action: 'bucket_updated',
        details: { bucketId: bucket.id, name: bucket.name },
      },
      req
    );

    res.json({ message: 'Bucket updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBucket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bucket = await Bucket.findByPk(id);

    if (!bucket) {
      res.status(404).json({ error: 'Bucket not found' });
      return;
    }

    if (bucket.fileCount > 0) {
      res.status(400).json({
        error: 'Bucket not empty',
        message: 'Delete all files before deleting the bucket',
      });
      return;
    }

    await bucket.destroy();

    await logActivity(
      {
        type: LOG_TYPES.BUCKET,
        action: 'bucket_deleted',
        details: { bucketId: id, name: bucket.name },
      },
      req
    );

    res.json({ message: 'Bucket deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
