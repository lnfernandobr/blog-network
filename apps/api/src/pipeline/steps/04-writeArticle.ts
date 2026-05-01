import { writeArticle } from '../../ai/index.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 4 — Escrita do artigo seguindo o outline.
 *
 * Gera markdown completo. Em produção essa é a etapa mais cara em tokens.
 */
export const writeArticleStep: PipelineStep = async (ctx) => {
  const { channel, topic, outline } = ctx;
  if (!topic || !outline) throw new Error('write: topic/outline missing');

  ctx.article = await writeArticle({
    refinedTitle: topic.refinedTitle,
    hook: outline.hook,
    sections: outline.sections,
    faq: outline.faq,
    wordCountTarget: outline.wordCountTarget,
    primaryKeyword: topic.selected.primaryKeyword,
    secondaryKeywords: topic.selected.secondaryKeywords,
    language: channel.language || 'pt-BR',
    channelName: channel.name,
    niche: channel.niche,
  });
};
