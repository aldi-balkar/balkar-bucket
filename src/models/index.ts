import sequelize from '../config/sequelize';
import User from './User';
import Role from './Role';
import Permission from './Permission';
import Bucket from './Bucket';
import File from './File';
import ApiKey from './ApiKey';
import Log from './Log';
import Setting from './Setting';

// Define relationships
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

Bucket.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(Bucket, { foreignKey: 'ownerId', as: 'buckets' });

File.belongsTo(Bucket, { foreignKey: 'bucketId', as: 'bucket' });
Bucket.hasMany(File, { foreignKey: 'bucketId', as: 'files' });

File.belongsTo(ApiKey, { foreignKey: 'apiKeyId', as: 'apiKey' });
ApiKey.hasMany(File, { foreignKey: 'apiKeyId', as: 'files' });

File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });

Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Log.belongsTo(ApiKey, { foreignKey: 'apiKeyId', as: 'apiKey' });

export {
  sequelize,
  User,
  Role,
  Permission,
  Bucket,
  File,
  ApiKey,
  Log,
  Setting,
};
