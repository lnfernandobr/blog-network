import { z } from 'zod';

const digits = (raw) => String(raw ?? '').replace(/\D/g, '');

export const waitlistSignupSchema = z.object({
  phone: z
    .string()
    .min(1, 'phone is required')
    .transform(digits)
    .refine((d) => d.length >= 10 && d.length <= 13, {
      message: 'phone must contain 10–13 digits',
    }),
  source: z.string().trim().min(1).max(64).optional(),
});
