import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export async function bootstrapAdmin() {
  const username = env.ADMIN_BOOTSTRAP_USERNAME.toLowerCase();
  const existing = await User.findOne({ username });
  if (existing) return;
  const passwordHash = await bcrypt.hash(env.ADMIN_BOOTSTRAP_PASSWORD, 12);
  await User.create({
    name: env.ADMIN_BOOTSTRAP_NAME,
    username,
    passwordHash,
    role: 'admin',
  });
  logger.info({ username }, 'bootstrap admin user created');
}
