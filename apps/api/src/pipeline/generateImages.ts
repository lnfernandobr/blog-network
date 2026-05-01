import { generateImage } from '../ai/index.js';
import type { PipelineStep } from './types.js';

export const generateImagesStep: PipelineStep = async (ctx) => {
  const { channel, article } = ctx;
  if (!article) return;
  ctx.cover = await generateImage({
    title: article.title,
    niche: channel.niche,
  });
};
