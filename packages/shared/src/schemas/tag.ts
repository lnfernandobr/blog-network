import { z } from 'zod';
import { slugSchema } from './common';

export const tagInputSchema = z.object({
  channelId: z.string(),
  slug: slugSchema,
  name: z.string().min(1).max(60),
});

export type TagInput = z.infer<typeof tagInputSchema>;

export const tagDtoSchema = tagInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TagDto = z.infer<typeof tagDtoSchema>;
