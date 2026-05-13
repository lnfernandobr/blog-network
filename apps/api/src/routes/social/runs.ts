import { Router, type Router as RouterType } from 'express';
import { SocialRun } from '../../models/SocialRun.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { NotFound } from '../../utils/errors.js';

export const socialRunsRouter: RouterType = Router();

socialRunsRouter.use(requireAuth);

socialRunsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { campaignId, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (campaignId) filter.campaignId = campaignId;
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [items, total] = await Promise.all([
      SocialRun.find(filter)
        .sort({ startedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      SocialRun.countDocuments(filter),
    ]);

    res.json({
      items: items.map(runToDto),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  }),
);

socialRunsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const run = await SocialRun.findById(req.params.id).lean();
    if (!run) throw NotFound('Run not found');
    res.json(runToDto(run));
  }),
);

function runToDto(r: any) {
  return {
    id: String(r._id),
    campaignId: String(r.campaignId),
    trigger: r.trigger,
    cronExpression: r.cronExpression,
    status: r.status,
    startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : new Date().toISOString(),
    finishedAt: r.finishedAt ? new Date(r.finishedAt).toISOString() : undefined,
    durationMs: r.durationMs,
    steps: (r.steps ?? []).map((s: any) => ({
      name: s.name,
      status: s.status,
      startedAt: s.startedAt ? new Date(s.startedAt).toISOString() : undefined,
      finishedAt: s.finishedAt ? new Date(s.finishedAt).toISOString() : undefined,
      durationMs: s.durationMs,
      message: s.message,
    })),
    postId: r.postId ? String(r.postId) : undefined,
    error: r.error,
  };
}
