import { generateTags } from '../ai/index.js';
import { Tag } from '../models/Tag.js';
import type { PipelineStep } from './types.js';

export const resolveTagsStep: PipelineStep = async (ctx) => {
  const { channel, article } = ctx;
  if (!article) throw new Error('resolveTags: article missing');

  const result = await generateTags({
    title: article.title,
    excerpt: article.excerpt,
    niche: channel.niche,
    contentExcerpt: article.content.split('\n').slice(0, 12).join('\n'),
  });

  for (const slug of result.tags) {
    await Tag.updateOne(
      { channelId: channel._id, slug } as any,
      { $setOnInsert: { channelId: channel._id, slug, name: slug.replace(/-/g, ' ') } },
      { upsert: true },
    ).catch(() => {});
  }
  ctx.tagSlugs = result.tags;
};
