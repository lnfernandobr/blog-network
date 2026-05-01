import { Router } from 'express';
import { paginationQuerySchema } from '@bn/shared';
import { Channel } from '../models/Channel.js';
import { Post } from '../models/Post.js';
import { Author } from '../models/Author.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { NotFound } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authorToDto, categoryToDto, channelToDto, postToDto, tagToDto } from '../utils/dto.js';

export const publicRouter: Router = Router();

async function getChannelBySlugOrFail(slug: string) {
  const ch = await Channel.findOne({ slug }).lean();
  if (!ch) throw NotFound(`Channel "${slug}" not found`);
  return ch;
}

publicRouter.get(
  '/channels/:slug',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    res.json(channelToDto(channel as any));
  }),
);

publicRouter.get(
  '/channels/:slug/posts',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const { page, limit, q } = paginationQuerySchema.parse(req.query);
    const categorySlug = (req.query.category as string) || undefined;
    const authorSlug = (req.query.author as string) || undefined;
    const tag = (req.query.tag as string) || undefined;
    const featured = req.query.featured === 'true';

    const filter: any = { channelId: channel._id, status: 'published' };
    if (q) filter.$text = { $search: q };
    if (tag) filter.tags = tag;
    if (featured) filter.featured = true;

    if (categorySlug) {
      const cat = await Category.findOne({ channelId: channel._id, slug: categorySlug } as any).lean();
      if (!cat) throw NotFound('Category not found');
      filter.categoryId = cat._id;
    }
    if (authorSlug) {
      const author = await Author.findOne({ channelId: channel._id, slug: authorSlug } as any).lean();
      if (!author) throw NotFound('Author not found');
      filter.authorId = author._id;
    }

    const [items, total, authors, categories] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
      Author.find({ channelId: channel._id } as any).lean(),
      Category.find({ channelId: channel._id } as any).lean(),
    ]);

    const aMap = new Map(authors.map((a) => [String(a._id), a]));
    const cMap = new Map(categories.map((c) => [String(c._id), c]));

    res.json({
      items: items.map((p) =>
        postToDto(p as any, {
          author: aMap.get(String(p.authorId)) as any,
          category: cMap.get(String(p.categoryId)) as any,
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

publicRouter.get(
  '/channels/:slug/posts/:postSlug',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const post = await Post.findOne({
      channelId: channel._id,
      slug: req.params.postSlug,
      status: 'published',
    } as any).lean();
    if (!post) throw NotFound('Post not found');
    const [author, category] = await Promise.all([
      Author.findById(post.authorId).lean(),
      Category.findById(post.categoryId).lean(),
    ]);
    res.json(postToDto(post as any, { author: author as any, category: category as any }));
  }),
);

publicRouter.get(
  '/channels/:slug/related/:postSlug',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const current = await Post.findOne({ channelId: channel._id, slug: req.params.postSlug } as any).lean();
    if (!current) throw NotFound('Post not found');
    const limit = Math.min(Number(req.query.limit ?? 4), 12);
    const items = await Post.find({
      channelId: channel._id,
      status: 'published',
      _id: { $ne: current._id },
      $or: [
        { categoryId: current.categoryId },
        { tags: { $in: current.tags } },
      ],
    } as any)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    const authors = await Author.find({ _id: { $in: items.map((i) => i.authorId) } }).lean();
    const categories = await Category.find({ _id: { $in: items.map((i) => i.categoryId) } }).lean();
    const aMap = new Map(authors.map((a) => [String(a._id), a]));
    const cMap = new Map(categories.map((c) => [String(c._id), c]));
    res.json({
      items: items.map((p) =>
        postToDto(p as any, {
          author: aMap.get(String(p.authorId)) as any,
          category: cMap.get(String(p.categoryId)) as any,
        }),
      ),
    });
  }),
);

publicRouter.get(
  '/channels/:slug/categories',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const items = await Category.find({ channelId: channel._id } as any).sort({ order: 1, name: 1 }).lean();
    res.json({ items: items.map((c) => categoryToDto(c as any)) });
  }),
);

publicRouter.get(
  '/channels/:slug/categories/:catSlug',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const cat = await Category.findOne({ channelId: channel._id, slug: req.params.catSlug } as any).lean();
    if (!cat) throw NotFound('Category not found');
    res.json(categoryToDto(cat as any));
  }),
);

publicRouter.get(
  '/channels/:slug/authors',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const items = await Author.find({ channelId: channel._id } as any).sort({ name: 1 }).lean();
    res.json({ items: items.map((a) => authorToDto(a as any)) });
  }),
);

publicRouter.get(
  '/channels/:slug/authors/:authorSlug',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const author = await Author.findOne({ channelId: channel._id, slug: req.params.authorSlug } as any).lean();
    if (!author) throw NotFound('Author not found');
    res.json(authorToDto(author as any));
  }),
);

publicRouter.get(
  '/channels/:slug/tags',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const tags = await Tag.find({ channelId: channel._id } as any).sort({ name: 1 }).lean();
    res.json({ items: tags.map((t) => tagToDto(t as any)) });
  }),
);

publicRouter.get(
  '/channels/:slug/search',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const pageN = Math.max(1, Number(req.query.page ?? 1));
    const limitN = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
    if (!q || q.trim().length < 2) {
      res.json({ items: [], total: 0, page: pageN, limit: limitN, totalPages: 0 });
      return;
    }
    const filter: any = {
      channelId: channel._id,
      status: 'published',
      $text: { $search: q },
    };
    const [items, total] = await Promise.all([
      Post.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip((pageN - 1) * limitN)
        .limit(limitN)
        .lean(),
      Post.countDocuments(filter),
    ]);
    const authors = await Author.find({ _id: { $in: items.map((i) => i.authorId) } }).lean();
    const categories = await Category.find({ _id: { $in: items.map((i) => i.categoryId) } }).lean();
    const aMap = new Map(authors.map((a) => [String(a._id), a]));
    const cMap = new Map(categories.map((c) => [String(c._id), c]));
    res.json({
      items: items.map((p) =>
        postToDto(p as any, {
          author: aMap.get(String(p.authorId)) as any,
          category: cMap.get(String(p.categoryId)) as any,
        }),
      ),
      total,
      page: pageN,
      limit: limitN,
      totalPages: Math.max(1, Math.ceil(total / limitN)),
    });
  }),
);

publicRouter.get(
  '/channels/:slug/sitemap',
  asyncHandler(async (req, res) => {
    const channel = await getChannelBySlugOrFail(String(req.params.slug));
    const [posts, categories, authors] = await Promise.all([
      Post.find({ channelId: channel._id, status: 'published' } as any)
        .select({ slug: 1, updatedAt: 1, publishedAt: 1 })
        .sort({ publishedAt: -1 })
        .lean(),
      Category.find({ channelId: channel._id } as any).select({ slug: 1, updatedAt: 1 }).lean(),
      Author.find({ channelId: channel._id } as any).select({ slug: 1, updatedAt: 1 }).lean(),
    ]);
    res.json({
      posts: posts.map((p) => ({
        slug: p.slug,
        updatedAt: (p.updatedAt ?? p.publishedAt ?? new Date()).toISOString(),
      })),
      categories: categories.map((c) => ({
        slug: c.slug,
        updatedAt: (c.updatedAt ?? new Date()).toISOString(),
      })),
      authors: authors.map((a) => ({
        slug: a.slug,
        updatedAt: (a.updatedAt ?? new Date()).toISOString(),
      })),
    });
  }),
);
