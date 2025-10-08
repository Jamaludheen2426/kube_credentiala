import { Request, Response, NextFunction } from 'express';
import logger from '../logger/index.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error: %s', err?.stack || err?.message || String(err));
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: 'internal_error' });
}
