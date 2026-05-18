import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// .env.local takes precedence (dev), then .env (defaults / production).
// Same convention Next.js uses.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Empty strings ("") exported by Doppler/CI count as "undefined" so
// defaults apply consistently.
const sanitized = Object.fromEntries(
  Object.entries(process.env).filter(([, v]) => v !== ''),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/fernandolimaindie'),
  JWT_SECRET: z.string().min(16).default('dev-secret-change-me-please-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  ADMIN_BOOTSTRAP_NAME: z.string().default('Fernando'),
  ADMIN_BOOTSTRAP_USERNAME: z.string().default('fernando'),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().default('Fz9mPx7Kq2vRtY8n'),

  // CORS: comma-separated list of allowed origins. "*" = open.
  // In production: "https://admin.example.com,https://mysite.com"
  ALLOWED_ORIGINS: z.string().default('*'),
});

export const env = envSchema.parse(sanitized);
