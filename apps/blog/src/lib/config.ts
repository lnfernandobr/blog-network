export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
export const CHANNEL_SLUG = process.env.NEXT_PUBLIC_CHANNEL_SLUG ?? 'cafe';
export const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? 'dev-revalidate-secret';
