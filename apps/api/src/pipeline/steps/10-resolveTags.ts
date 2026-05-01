import { generateTags } from '../../ai/index.js';
import { Tag } from '../../models/Tag.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 10 — Define tags do post.
 *
 * Combina sugestões da metadata + uma chamada de refinamento do generateTags
 * (que considera tags já existentes pra cluster). Cria tags faltantes via upsert.
 */
export const resolveTagsStep: PipelineStep = async (ctx) => {
  const { channel, topic, article, metadata } = ctx;
  if (!topic || !article || !metadata) throw new Error('resolveTags: prerequisites missing');

  // Tags existentes pra IA priorizar reuso
  const existingTagDocs = await Tag.find({ channelId: channel._id } as any)
    .select({ slug: 1 })
    .lean();
  const existingTags = existingTagDocs.map((t) => t.slug);

  const refined = await generateTags({
    title: topic.refinedTitle,
    excerpt: article.excerpt,
    niche: channel.niche,
    contentExcerpt: article.content.split('\n').slice(0, 12).join('\n'),
    existingTags,
  });

  // Combina suggestedTags da metadata + refinamento, dedup
  const allSlugs = Array.from(
    new Set([...(metadata.suggestedTags ?? []), ...refined.tags]),
  ).slice(0, 6);

  for (const slug of allSlugs) {
    await Tag.updateOne(
      { channelId: channel._id, slug } as any,
      { $setOnInsert: { channelId: channel._id, slug, name: slug.replace(/-/g, ' ') } },
      { upsert: true },
    ).catch(() => {});
  }
  ctx.tagSlugs = allSlugs;
};
