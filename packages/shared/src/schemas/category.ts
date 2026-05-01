import { z } from 'zod';
import { slugSchema } from './common';

export const categoryInputSchema = z.object({
  channelId: z.string(),
  slug: slugSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    .default('#0f172a'),
  iconKey: z.string().optional(),
  order: z.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const categoryDtoSchema = categoryInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CategoryDto = z.infer<typeof categoryDtoSchema>;
