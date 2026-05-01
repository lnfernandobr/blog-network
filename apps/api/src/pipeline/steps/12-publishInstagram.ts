import type { PipelineStep } from '../types.js';
import { logger } from '../../config/logger.js';

export const publishInstagramStep: PipelineStep = async (ctx) => {
  if (!ctx.post) return;
  // Stub: integração real viria aqui.
  logger.info(
    {
      channel: ctx.channel.slug,
      post: ctx.post.slug,
      title: ctx.post.title,
    },
    '[stub] would publish to Instagram',
  );
};
