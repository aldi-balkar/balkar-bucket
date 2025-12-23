export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  OTHER: 'other',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const API_KEY_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

export const LOG_TYPES = {
  UPLOAD: 'upload',
  DELETE: 'delete',
  ACCESS: 'access',
  AUTH: 'auth',
  BUCKET: 'bucket',
};

export const PERMISSIONS = {
  BUCKETS_CREATE: 'buckets.create',
  BUCKETS_READ: 'buckets.read',
  BUCKETS_UPDATE: 'buckets.update',
  BUCKETS_DELETE: 'buckets.delete',
  FILES_UPLOAD: 'files.upload',
  FILES_READ: 'files.read',
  FILES_DELETE: 'files.delete',
  API_KEYS_CREATE: 'api-keys.create',
  API_KEYS_READ: 'api-keys.read',
  API_KEYS_REVOKE: 'api-keys.revoke',
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  SETTINGS_UPDATE: 'settings.update',
};
