import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_POST_URL = 'https://open.tiktokapis.com/v2/post/publish/content/init/';

// In-memory PKCE store: state → { verifier, expiresAt }
const pkceStore = new Map<string, { verifier: string; expiresAt: number }>();

function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

export function storePKCEForState(state: string): string {
  // Prune stale entries
  for (const [k, v] of pkceStore) {
    if (v.expiresAt < Date.now()) pkceStore.delete(k);
  }
  const { codeVerifier, codeChallenge } = generatePKCE();
  pkceStore.set(state, { verifier: codeVerifier, expiresAt: Date.now() + 10 * 60 * 1000 });
  return codeChallenge;
}

export function consumePKCEForState(state: string): string | undefined {
  const entry = pkceStore.get(state);
  pkceStore.delete(state);
  if (!entry || entry.expiresAt < Date.now()) return undefined;
  return entry.verifier;
}

export interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  open_id: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
}

export interface TikTokPostResult {
  publishId: string;
  shareUrl?: string;
}

export function buildAuthUrl(state: string, codeChallenge: string): string {
  const redirectUri = `${env.PUBLIC_API_URL}/api/v1/social/accounts/tiktok/callback`;
  const params = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY ?? '',
    scope: 'user.info.basic,video.upload',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string, codeVerifier: string): Promise<TikTokTokenResponse> {
  const redirectUri = `${env.PUBLIC_API_URL}/api/v1/social/accounts/tiktok/callback`;
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY ?? '',
      client_secret: env.TIKTOK_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }).toString(),
  });
  const data = (await res.json()) as any;
  if (!res.ok || data.error) {
    throw new Error(`TikTok token exchange failed: ${data.error_description ?? data.error ?? res.status}`);
  }
  return data as TikTokTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse> {
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY ?? '',
      client_secret: env.TIKTOK_CLIENT_SECRET ?? '',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });
  const data = (await res.json()) as any;
  if (!res.ok || data.error) {
    throw new Error(`TikTok token refresh failed: ${data.error_description ?? data.error ?? res.status}`);
  }
  return data as TikTokTokenResponse;
}

export async function postPhotoCarousel(
  accessToken: string,
  opts: {
    caption: string;
    hashtags: string[];
    images: { url: string; localPath?: string }[];
  },
): Promise<TikTokPostResult> {
  // TikTok PHOTO posts only accept PULL_FROM_URL. The pull URLs must be on a
  // domain that's verified in the TikTok developer portal.
  const hashtagLine = opts.hashtags.map((h) => `#${h.replace(/^#/, '')}`).join(' ');
  const shortTitle = opts.caption.split(/\n/)[0]!.slice(0, 90);
  const fullDescription = `${opts.caption}\n\n${hashtagLine}`.slice(0, 2200);

  const body = {
    post_mode: 'MEDIA_UPLOAD',
    media_type: 'PHOTO',
    post_info: {
      title: shortTitle,
      description: fullDescription,
      disable_comment: false,
      auto_add_music: true,
      brand_content_toggle: false,
      brand_organic_toggle: false,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      photo_images: opts.images.map((i) => i.url),
      photo_cover_index: 0,
    },
  };

  logger.info({ imageCount: opts.images.length, body }, 'posting carousel to TikTok');

  const res = await fetch(TIKTOK_POST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;
  logger.info({ status: res.status, response: data }, 'tiktok response');

  if (!res.ok || (data.error && data.error.code !== 'ok')) {
    throw new Error(
      `TikTok post failed: ${data.error?.message ?? data.error?.code ?? res.status}`,
    );
  }

  return {
    publishId: data.data?.publish_id ?? '',
    shareUrl: data.data?.share_url,
  };
}
