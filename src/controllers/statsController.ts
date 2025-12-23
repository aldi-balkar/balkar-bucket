import { Response } from 'express';
import { Bucket, File, ApiKey, Log } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Storage stats
    const totalStorage = BigInt(107374182400); // 100GB default
    const usedStorageResult = await Bucket.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('used_space')), 'total']],
      raw: true,
    });
    const usedStorage = Number((usedStorageResult as any)?.total || 0);
    const storagePercentage = Math.round((usedStorage / Number(totalStorage)) * 100);

    // Files stats
    const totalFiles = await File.count({ where: { isDeleted: false } });
    const filesInTrash = await File.count({ where: { isDeleted: true } });

    // Buckets stats
    const totalBuckets = await Bucket.count();
    const publicBuckets = await Bucket.count({ where: { isPublic: true } });
    const privateBuckets = await Bucket.count({ where: { isPublic: false } });

    // API Keys stats
    const activeApiKeys = await ApiKey.count({ where: { status: 'active' } });
    const totalApiKeys = await ApiKey.count();

    // Upload trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const uploadTrend = await Log.findAll({
      where: {
        type: 'upload',
        createdAt: { [Op.gte]: sevenDaysAgo },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'files'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true,
    });

    // Recent uploads (last 10)
    const recentUploads = await File.findAll({
      where: { isDeleted: false },
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'originalName', 'size', 'mimeType', 'createdAt'],
    });

    // Recent errors (last 10)
    const recentErrors = await Log.findAll({
      where: { status: 'failed' },
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'action', 'details', 'createdAt'],
    });

    // Top buckets by storage
    const topBuckets = await Bucket.findAll({
      limit: 5,
      order: [['usedSpace', 'DESC']],
      attributes: ['id', 'name', 'usedSpace', 'fileCount'],
    });

    // Top API keys by usage
    const topApps = await ApiKey.findAll({
      limit: 5,
      order: [['totalRequests', 'DESC']],
      attributes: ['id', 'name', 'totalRequests', 'totalUploads', 'storageUsed'],
    });

    // Security stats
    const unlimitedApiKeys = await ApiKey.count({
      where: { rateLimitEnabled: false },
    });

    res.json({
      storage: {
        total: totalStorage,
        used: usedStorage,
        percentage: storagePercentage,
      },
      files: {
        total: totalFiles,
        inTrash: filesInTrash,
      },
      buckets: {
        total: totalBuckets,
        public: publicBuckets,
        private: privateBuckets,
      },
      apiKeys: {
        active: activeApiKeys,
        total: totalApiKeys,
      },
      uploadTrend,
      recentUploads,
      recentErrors,
      topBuckets,
      topApps,
      security: {
        publicBuckets,
        expiredSignedUrls: 0, // Placeholder
        unlimitedApiKeys,
        fileScans: {
          clean: totalFiles,
          infected: 0,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
