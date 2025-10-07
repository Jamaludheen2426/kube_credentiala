import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info('%s %s %d %dms', req.method, req.originalUrl, res.statusCode, ms);
  });
  next();
}
