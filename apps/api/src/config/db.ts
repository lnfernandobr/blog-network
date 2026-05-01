import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  logger.info({ uri: env.MONGODB_URI.replace(/\/\/.*?@/, '//***@') }, 'mongodb connected');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
