import { Router } from 'express';
import { CronExpressionParser } from 'cron-parser';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { describeNextRuns } from '../scheduler/index.js';
import { Channel } from '../models/Channel.js';
import { NotFound } from '../utils/errors.js';

export const schedulerRouter: Router = Router();

schedulerRouter.use(requireAuth);

schedulerRouter.get(
  '/preview',
  asyncHandler(async (req, res) => {
    const expr = String(req.query.cron ?? '');
    const tz = String(req.query.tz ?? 'America/Sao_Paulo');
    if (!expr) {
      res.json({ valid: false, next: [] });
      return;
    }
    try {
      const it = CronExpressionParser.parse(expr, { tz });
      const next: string[] = [];
      for (let i = 0; i < 5; i++) next.push(it.next().toDate().toISOString());
      res.json({ valid: true, next });
    } catch {
      res.json({ valid: false, next: [] });
    }
  }),
);

schedulerRouter.get(
  '/channels/:id/next',
  asyncHandler(async (req, res) => {
    const ch = await Channel.findById(req.params.id).lean();
    if (!ch) throw NotFound('Channel not found');
    res.json({ items: describeNextRuns(String(req.params.id), 5) });
  }),
);
