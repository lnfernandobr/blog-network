import { Run } from '../models/Run.js';
import type { ChannelDoc } from '../models/Channel.js';
import { logger } from '../config/logger.js';
import type { PipelineContext, PipelineStep } from './types.js';
import { generateArticleStep } from './generateArticle.js';
import { generateImagesStep } from './generateImages.js';
import { resolveAuthorStep } from './resolveAuthor.js';
import { resolveCategoryStep } from './resolveCategory.js';
import { resolveTagsStep } from './resolveTags.js';
import { publishPostStep } from './publishPost.js';
import { publishInstagramStep } from './publishInstagram.js';

interface PipelineSpec {
  name: string;
  fn: PipelineStep;
}

/**
 * Ordem importa: cada etapa pode depender do output das anteriores via `ctx`.
 * - generate-article    → preenche ctx.article
 * - generate-image      → preenche ctx.cover (lê article.title)
 * - resolve-author      → preenche ctx.author
 * - resolve-category    → preenche ctx.category (cria/reutiliza)
 * - resolve-tags        → preenche ctx.tagSlugs (cria tags faltantes)
 * - publish-post        → grava o Post no DB
 * - publish-instagram   → publica/loga (stub)
 */
const STEPS: PipelineSpec[] = [
  { name: 'generate-article', fn: generateArticleStep },
  { name: 'generate-image', fn: generateImagesStep },
  { name: 'resolve-author', fn: resolveAuthorStep },
  { name: 'resolve-category', fn: resolveCategoryStep },
  { name: 'resolve-tags', fn: resolveTagsStep },
  { name: 'publish-post', fn: publishPostStep },
  { name: 'publish-instagram', fn: publishInstagramStep },
];

export async function runChannelPipeline(
  channel: ChannelDoc & { _id: any },
  opts: { trigger: 'cron' | 'manual'; cronExpression?: string } = { trigger: 'manual' },
) {
  const run = await Run.create({
    channelId: channel._id,
    trigger: opts.trigger,
    cronExpression: opts.cronExpression,
    status: 'running',
    startedAt: new Date(),
    steps: [],
  });

  const ctx: PipelineContext = { channel, run };
  const startedAt = Date.now();
  let overall: 'success' | 'error' | 'partial' = 'success';
  let firstError: string | undefined;

  for (const spec of STEPS) {
    const stepStarted = Date.now();
    run.steps.push({
      name: spec.name,
      status: 'running',
      startedAt: new Date(stepStarted),
    } as any);
    await run.save();

    try {
      await spec.fn(ctx);
      const finished = Date.now();
      const last = run.steps[run.steps.length - 1] as any;
      last.status = 'success';
      last.finishedAt = new Date(finished);
      last.durationMs = finished - stepStarted;
      await run.save();
    } catch (err) {
      const finished = Date.now();
      const last = run.steps[run.steps.length - 1] as any;
      last.status = 'error';
      last.finishedAt = new Date(finished);
      last.durationMs = finished - stepStarted;
      last.message = err instanceof Error ? err.message : String(err);
      await run.save();
      firstError ??= last.message;
      overall = ctx.post ? 'partial' : 'error';
      logger.error({ err, step: spec.name, channel: channel.slug }, 'pipeline step failed');
      if (overall === 'error') break;
    }
  }

  const finishedAt = Date.now();
  run.status = overall;
  run.finishedAt = new Date(finishedAt);
  run.durationMs = finishedAt - startedAt;
  if (ctx.post) run.postId = ctx.post._id;
  if (firstError) run.error = firstError;
  await run.save();

  logger.info(
    {
      channel: channel.slug,
      runId: String(run._id),
      status: run.status,
      durationMs: run.durationMs,
      postSlug: ctx.post?.slug,
    },
    'pipeline finished',
  );
  return run;
}
