import { Router } from 'express';
import { paginationQuerySchema } from '@bn/shared';
import { Run } from '../models/Run.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { runToDto } from '../utils/dto.js';
import { runChannelPipeline } from '../pipeline/runner.js';
import { Channel } from '../models/Channel.js';
import { NotFound } from '../utils/errors.js';

export const runsRouter: Router = Router();

runsRouter.use(requireAuth);

runsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit } = paginationQuerySchema.parse(req.query);
    const channelId = (req.query.channelId as string) || undefined;
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;
    const [items, total] = await Promise.all([
      Run.find(filter)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Run.countDocuments(filter),
    ]);
    res.json({
      items: items.map((r) => runToDto(r as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

runsRouter.post(
  '/trigger/:channelId',
  asyncHandler(async (req, res) => {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) throw NotFound('Channel not found');
    const run = await runChannelPipeline(channel, { trigger: 'manual' });
    res.status(202).json(runToDto(run as any));
  }),
);
