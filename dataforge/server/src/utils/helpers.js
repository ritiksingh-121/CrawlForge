import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const parseCronExpression = (schedule) => {
  const intervals = {
    'every_5_min': '*/5 * * * *',
    'every_15_min': '*/15 * * * *',
    'every_30_min': '*/30 * * * *',
    'hourly': '0 * * * *',
    'daily': '0 0 * * *',
    'weekly': '0 0 * * 0',
    'monthly': '0 0 1 * *',
  };
  return intervals[schedule] || null;
};

export const paginate = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { limit: Math.min(limit, 100), offset };
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
