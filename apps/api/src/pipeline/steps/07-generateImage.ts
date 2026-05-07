import { generateImage } from '../../ai/index.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 7 — Geração da imagem com base no brief.
 *
 * Em mock, retorna URL de placeholder determinístico (picsum).
 * Em produção (com OpenAIProvider implementado), gera via gpt-image-1/DALL-E.
 */
export const generateImageStep: PipelineStep = async (ctx) => {
  const { topic, imageBrief } = ctx;
  if (!topic || !imageBrief) throw new Error('image: topic/imageBrief missing');

  ctx.cover = await generateImage({
    prompt: imageBrief.prompt,
    negativePrompt: imageBrief.negativePrompt,
    alt: imageBrief.alt,
    seed: topic.refinedTitle,
  });
};
