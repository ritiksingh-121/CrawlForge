import logger from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, _next) => {
  logger.error(err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: err.errors?.map((e) => e.message).join(', ') || 'Validation error',
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists.',
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed.',
      details: err.errors,
    });
  }

  return res.status(500).json({
    error: 'Internal server error.',
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
};
