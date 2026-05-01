import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export function requestLog(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(ms),
      },
      'http',
    );
  });
  next();
}
