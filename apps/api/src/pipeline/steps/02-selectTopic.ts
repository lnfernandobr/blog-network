import { selectTopic } from '../../ai/index.js';
import { Post } from '../../models/Post.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 2 — Escolha do tema entre os candidatos.
 *
 * Aplica critérios de gap, intenção, utilidade e balanceamento de formato
 * baseado no que o canal já publicou recentemente.
 */
export const selectTopicStep: PipelineStep = async (ctx) => {
  const { channel, candidates } = ctx;
  if (!candidates?.length) throw new Error('selectTopic: brainstorm output missing');

  // Coleta distribuição recente de formato pra balancear escolha
  const recent = await Post.find({ channelId: channel._id, status: 'published' } as any)
    .select({ slug: 1, format: 1 })
    .sort({ publishedAt: -1 })
    .limit(20)
    .lean();

  const recentFormats: Record<string, number> = {};
  for (const p of recent) {
    const f = (p.format as string) || 'article';
    recentFormats[f] = (recentFormats[f] || 0) + 1;
  }

  ctx.topic = await selectTopic({
    channelName: channel.name,
    niche: channel.niche,
    candidates,
    recentSlugs: recent.map((p) => p.slug),
    recentFormats,
  });
};
