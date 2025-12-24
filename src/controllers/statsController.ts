import { Response } from 'express';
import { Bucket, File, ApiKey, Log } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize';
import logger from '../config/logger';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Storage stats
    const totalStorage = 107374182400; // 100GB default
    const usedStorageResult = await Bucket.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('used_space')), 'total']],
      raw: true,
    });
    const usedStorage = Number((usedStorageResult as any)?.total || 0);
    const availableStorage = totalStorage - usedStorage;
    const storagePercentage = Math.round((usedStorage / totalStorage) * 100);

    // Files stats by type
    const totalFiles = await File.count({ where: { isDeleted: false } });
    const filesInTrash = await File.count({ where: { isDeleted: true } });

    const imageFiles = await File.count({
      where: {
        isDeleted: false,
        mimeType: { [Op.like]: 'image/%' },
      },
    });

    const documentFiles = await File.count({
      where: {
        isDeleted: false,
        mimeType: {
          [Op.or]: [
            { [Op.like]: 'application/pdf' },
            { [Op.like]: 'application/msword%' },
            { [Op.like]: 'application/vnd.openxmlformats%' },
          ],
        },
      },
    });

    const videoFiles = await File.count({
      where: {
        isDeleted: false,
        mimeType: { [Op.like]: 'video/%' },
      },
    });

    const otherFiles = totalFiles - imageFiles - documentFiles - videoFiles;

    // Buckets stats
    const totalBuckets = await Bucket.count();
    const publicBuckets = await Bucket.count({ where: { isPublic: true } });
    const privateBuckets = totalBuckets - publicBuckets;

    // API Keys stats
    const activeApiKeys = await ApiKey.count({ where: { status: 'active' } });
    const revokedApiKeys = await ApiKey.count({ where: { status: 'revoked' } });
    const totalApiKeys = await ApiKey.count();

    // Upload trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const uploadTrend = await Log.findAll({
      where: {
        type: 'upload',
        status: 'success',
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

    // Recent uploads (last 5)
    const recentUploadsData = await File.findAll({
      where: { isDeleted: false },
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'originalName', 'filename', 'size', 'mimeType', 'createdAt', 'uploadedBy'],
    });

    const recentUploads = recentUploadsData.map((file: any) => ({
      id: file.id,
      filename: file.originalName,
      size: file.size,
      user: file.uploadedBy || 'Unknown',
      timestamp: file.createdAt,
    }));

    // Top buckets by storage
    const topBucketsData = await Bucket.findAll({
      limit: 5,
      order: [['usedSpace', 'DESC']],
      attributes: ['id', 'name', 'usedSpace', 'fileCount'],
    });

    const topBuckets = topBucketsData.map((bucket: any) => ({
      id: bucket.id,
      name: bucket.name,
      storage: bucket.usedSpace,
      files: bucket.fileCount,
    }));

    // Top API keys by usage
    const topAppsData = await ApiKey.findAll({
      where: { status: 'active' },
      limit: 5,
      order: [['totalRequests', 'DESC']],
      attributes: ['id', 'name', 'totalRequests', 'totalUploads', 'storageUsed'],
    });

    const topApps = topAppsData.map((apiKey: any) => ({
      id: apiKey.id,
      name: apiKey.name,
      requests: Number(apiKey.totalRequests),
      uploads: Number(apiKey.totalUploads),
      storage: Number(apiKey.storageUsed),
    }));

    res.json({
      storage: {
        total: totalStorage,
        used: usedStorage,
        available: availableStorage,
        percentage: storagePercentage,
      },
      files: {
        total: totalFiles,
        images: imageFiles,
        documents: documentFiles,
        videos: videoFiles,
        others: otherFiles,
        inTrash: filesInTrash,
      },
      buckets: {
        total: totalBuckets,
        public: publicBuckets,
        private: privateBuckets,
      },
      apiKeys: {
        active: activeApiKeys,
        revoked: revokedApiKeys,
        total: totalApiKeys,
      },
      uploadTrend: uploadTrend.map((item: any) => ({
        date: item.date,
        files: parseInt(item.files),
        size: 0, // Can be calculated if needed
      })),
      recentUploads,
      topBuckets,
      topApps,
    });
  } catch (error: any) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch dashboard statistics',
    });
  }
};
