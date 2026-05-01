import { generateArticle } from '../ai/index.js';
import { Post } from '../models/Post.js';
import type { PipelineStep } from './types.js';

export const generateArticleStep: PipelineStep = async (ctx) => {
  const { channel } = ctx;

  // Evita repetir tema: lista os últimos 30 slugs publicados.
  const recent = await Post.find({ channelId: channel._id, status: 'published' } as any)
    .select({ slug: 1 })
    .sort({ publishedAt: -1 })
    .limit(30)
    .lean();

  ctx.article = await generateArticle({
    channelName: channel.name,
    niche: channel.niche,
    language: channel.language || 'pt-BR',
    existingSlugs: recent.map((p) => p.slug),
  });
};
