import { z } from 'zod';
import { slugSchema } from './common';

export const authorSocialsSchema = z.object({
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
  youtube: z.string().url().optional(),
  email: z.string().email().optional(),
});

export const authorInputSchema = z.object({
  channelId: z.string(),
  slug: slugSchema,
  name: z.string().min(1).max(120),
  jobTitle: z.string().max(120).optional(),
  shortBio: z.string().max(280).optional(),
  bio: z.string().max(8000).optional(),
  avatarUrl: z.string().url().optional(),
  expertise: z.array(z.string()).default([]),
  credentials: z.array(z.string()).default([]),
  socials: authorSocialsSchema.default({}),
});

export type AuthorInput = z.infer<typeof authorInputSchema>;

export const authorDtoSchema = authorInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AuthorDto = z.infer<typeof authorDtoSchema>;
