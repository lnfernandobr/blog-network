import { z } from 'zod';

export const loginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
