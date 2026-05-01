import { z } from 'zod';

export const runStatusSchema = z.enum(['queued', 'running', 'success', 'error', 'partial']);
export type RunStatus = z.infer<typeof runStatusSchema>;

export const runStepSchema = z.object({
  name: z.string(),
  status: runStatusSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  message: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type RunStep = z.infer<typeof runStepSchema>;

export const runDtoSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  trigger: z.enum(['cron', 'manual']),
  cronExpression: z.string().optional(),
  status: runStatusSchema,
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  steps: z.array(runStepSchema),
  postId: z.string().optional(),
  error: z.string().optional(),
});

export type RunDto = z.infer<typeof runDtoSchema>;
