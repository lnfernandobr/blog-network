import { generateCategory } from '../ai/index.js';
import { Category } from '../models/Category.js';
import type { PipelineStep } from './types.js';

const COLORS = ['#7c5e3c', '#5a3a22', '#9b6b3f', '#c08552', '#3a2417', '#1f4e5f', '#2c5f2d', '#5b2333'];

export const resolveCategoryStep: PipelineStep = async (ctx) => {
  const { channel, article } = ctx;
  if (!article) throw new Error('resolveCategory: article missing');

  const existing = await Category.find({ channelId: channel._id } as any)
    .select({ slug: 1, name: 1 })
    .lean();

  const suggested = await generateCategory({
    title: article.title,
    excerpt: article.excerpt,
    niche: channel.niche,
    existing: existing.map((c) => ({ slug: c.slug, name: c.name })),
  });

  let cat = await Category.findOne({ channelId: channel._id, slug: suggested.slug } as any);
  if (!cat) {
    const order = existing.length;
    cat = await Category.create({
      channelId: channel._id,
      slug: suggested.slug,
      name: suggested.name,
      description: suggested.description,
      color: COLORS[order % COLORS.length],
      order,
    });
  }
  ctx.category = cat as any;
};
