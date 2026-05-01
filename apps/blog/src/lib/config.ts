/**
 * Tratamos string vazia como "ausente" — o `??` do JS só cobre null/undefined,
 * mas a Vercel injeta strings vazias quando a env var existe mas não foi preenchida.
 */
function pick(value: string | undefined, fallback: string): string {
  if (!value || value.trim() === '') return fallback;
  return value;
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
const rawChannel = process.env.NEXT_PUBLIC_CHANNEL_SLUG ?? '';

export const API_URL = pick(rawApiUrl, 'http://localhost:4000').replace(/\/$/, '');
export const SITE_URL = pick(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3001').replace(/\/$/, '');
export const CHANNEL_SLUG = pick(rawChannel, '');
export const REVALIDATE_SECRET = pick(process.env.REVALIDATE_SECRET, 'dev-revalidate-secret');

/**
 * Quando true, o blog tem API + canal configurados e busca dados reais.
 * Quando false, o template renderiza um placeholder ("Blog em construção")
 * — útil pra build da Vercel passar antes da API estar no ar.
 */
export const HAS_API_CONFIG =
  rawApiUrl.trim() !== '' && rawChannel.trim() !== '';
