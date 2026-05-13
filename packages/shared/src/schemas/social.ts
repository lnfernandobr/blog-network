import { z } from 'zod';
import { timeOfDaySchema, weekdaySchema } from './channel';

export const socialPlatformSchema = z.enum(['tiktok']);
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

export const socialAccountInputSchema = z.object({
  platform: socialPlatformSchema,
  username: z.string().min(1).max(100),
  displayName: z.string().max(100).optional(),
  active: z.boolean().default(true),
});
export type SocialAccountInput = z.infer<typeof socialAccountInputSchema>;

export const socialAccountDtoSchema = socialAccountInputSchema.extend({
  id: z.string(),
  platformUserId: z.string(),
  tokenExpiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SocialAccountDto = z.infer<typeof socialAccountDtoSchema>;

export const promptConfigSchema = z.object({
  contentTypes: z.array(z.string()).default(['educational', 'listicle']),
  visualStyle: z.string().default('vibrant editorial photography, high contrast'),
  tone: z.string().default('educational and inspiring'),
  targetAudience: z.string().default(''),
  extraContext: z.string().default(''),
});
export type PromptConfig = z.infer<typeof promptConfigSchema>;

export const socialCampaignInputSchema = z.object({
  name: z.string().min(1).max(120),
  niche: z.string().min(1).max(120),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
  active: z.boolean().default(true),
  accountId: z.string().min(1),
  imageCount: z.number().int().min(1).max(10).default(5),
  notificationEmail: z.string().email(),
  publishTimes: z.array(timeOfDaySchema).default(['09:00']),
  publishWeekdays: z.array(weekdaySchema).default([0, 1, 2, 3, 4, 5, 6]),
  promptConfig: promptConfigSchema.optional(),
});
export type SocialCampaignInput = z.infer<typeof socialCampaignInputSchema>;

export const socialCampaignDtoSchema = socialCampaignInputSchema.extend({
  id: z.string(),
  promptConfig: promptConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SocialCampaignDto = z.infer<typeof socialCampaignDtoSchema>;

export const socialPostStatusSchema = z.enum([
  'generating',
  'pending_review',
  'published',
  'failed',
]);
export type SocialPostStatus = z.infer<typeof socialPostStatusSchema>;

export const socialPostImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  prompt: z.string(),
});
export type SocialPostImage = z.infer<typeof socialPostImageSchema>;

export const socialPostDtoSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  platform: socialPlatformSchema,
  status: socialPostStatusSchema,
  topic: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  images: z.array(socialPostImageSchema),
  platformPostId: z.string().optional(),
  platformShareUrl: z.string().optional(),
  notificationSentAt: z.string().optional(),
  publishedAt: z.string().optional(),
  failedAt: z.string().optional(),
  failureReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SocialPostDto = z.infer<typeof socialPostDtoSchema>;

export const socialRunStatusSchema = z.enum(['queued', 'running', 'success', 'error', 'partial']);
export type SocialRunStatus = z.infer<typeof socialRunStatusSchema>;

export const socialRunDtoSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  trigger: z.enum(['cron', 'manual']),
  cronExpression: z.string().optional(),
  status: socialRunStatusSchema,
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  steps: z.array(
    z.object({
      name: z.string(),
      status: socialRunStatusSchema,
      startedAt: z.string().optional(),
      finishedAt: z.string().optional(),
      durationMs: z.number().optional(),
      message: z.string().optional(),
    }),
  ),
  postId: z.string().optional(),
  error: z.string().optional(),
});
export type SocialRunDto = z.infer<typeof socialRunDtoSchema>;
