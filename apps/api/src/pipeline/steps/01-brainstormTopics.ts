import { brainstormTopics } from '../../ai/index.js';
import { Post } from '../../models/Post.js';
import { Category } from '../../models/Category.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 1 — Brainstorm de pautas.
 *
 * Pega contexto do canal (slugs recentes, categorias existentes) e pede ao
 * provider de texto pra gerar 8-10 candidatos diversificados em ângulo,
 * intenção e nível.
 */
export const brainstormTopicsStep: PipelineStep = async (ctx) => {
  const { channel } = ctx;

  const [recent, categories] = await Promise.all([
    Post.find({ channelId: channel._id, status: 'published' } as any)
      .select({ slug: 1 })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean(),
    Category.find({ channelId: channel._id } as any)
      .select({ slug: 1, name: 1 })
      .lean(),
  ]);

  const result = await brainstormTopics({
    channelName: channel.name,
    niche: channel.niche,
    language: channel.language || 'pt-BR',
    recentSlugs: recent.map((p) => p.slug),
    existingCategories: categories.map((c) => ({ slug: c.slug, name: c.name })),
  });

  if (result.candidates.length === 0) {
    throw new Error('brainstorm: provider returned no candidates');
  }

  ctx.candidates = result.candidates;
};
