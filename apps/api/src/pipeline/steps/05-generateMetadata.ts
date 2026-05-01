import { generateMetadata } from '../../ai/index.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 5 — Metadata SEO/GEO.
 *
 * metaTitle, metaDescription, slug, keywords, suggestedTags, summary.
 * Roda DEPOIS do artigo escrito pra que o modelo veja o conteúdo real
 * antes de descrevê-lo (gera meta mais fiel ao que está lá).
 */
export const generateMetadataStep: PipelineStep = async (ctx) => {
  const { channel, topic, article } = ctx;
  if (!topic || !article) throw new Error('metadata: topic/article missing');

  ctx.metadata = await generateMetadata({
    title: topic.refinedTitle,
    content: article.content,
    excerpt: article.excerpt,
    primaryKeyword: topic.selected.primaryKeyword,
    secondaryKeywords: topic.selected.secondaryKeywords,
    niche: channel.niche,
    channelName: channel.name,
    language: channel.language || 'pt-BR',
  });
};
