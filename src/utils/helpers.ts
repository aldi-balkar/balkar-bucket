export const generateApiKey = (): string => {
  const prefix = 'sk_live_';
  const randomString = Array.from({ length: 32 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
      Math.floor(Math.random() * 62)
    )
  ).join('');
  return prefix + randomString;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getPagination = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

export const getPaginationData = (count: number, page: number, limit: number) => {
  const totalPages = Math.ceil(count / limit);
  return {
    page,
    limit,
    total: count,
    totalPages,
  };
};
