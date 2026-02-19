export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.jetpicks.com/api',
  TIMEOUT: 30000,
  FILE_UPLOAD_TIMEOUT: 300000, // 5 minutes for large file uploads
};
