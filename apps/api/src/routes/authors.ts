import { Router } from 'express';
import { authorInputSchema, paginationQuerySchema } from '@bn/shared';
import { Author } from '../models/Author.js';
import { Conflict, NotFound } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { authorToDto } from '../utils/dto.js';

export const authorsRouter: Router = Router();

authorsRouter.use(requireAuth);

authorsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, q } = paginationQuerySchema.parse(req.query);
    const channelId = (req.query.channelId as string) || undefined;
    const filter: Record<string, unknown> = {};
    if (channelId) filter.channelId = channelId;
    if (q) filter.name = new RegExp(q, 'i');
    const [items, total] = await Promise.all([
      Author.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Author.countDocuments(filter),
    ]);
    res.json({
      items: items.map((a) => authorToDto(a as any)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

authorsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = authorInputSchema.parse(req.body);
    const exists = await Author.findOne({ channelId: data.channelId, slug: data.slug }).lean();
    if (exists) throw Conflict(`Author "${data.slug}" already exists in channel`);
    const created = await Author.create(data);
    res.status(201).json(authorToDto(created as any));
  }),
);

authorsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const author = await Author.findById(req.params.id).lean();
    if (!author) throw NotFound('Author not found');
    res.json(authorToDto(author as any));
  }),
);

authorsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = authorInputSchema.parse(req.body);
    const author = await Author.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!author) throw NotFound('Author not found');
    res.json(authorToDto(author as any));
  }),
);

authorsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) throw NotFound('Author not found');
    res.status(204).end();
  }),
);
