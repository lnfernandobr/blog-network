import { Router, type Router as RouterType } from 'express';
import crypto from 'node:crypto';
import { SocialAccount } from '../../models/SocialAccount.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { NotFound, BadRequest } from '../../utils/errors.js';
import { buildAuthUrl, storePKCEForState, consumePKCEForState, exchangeCode } from '../../services/tiktok.js';
import { env } from '../../config/env.js';

export const socialAccountsRouter: RouterType = Router();

// OAuth callback must come BEFORE requireAuth middleware — TikTok redirects here without a JWT
socialAccountsRouter.get(
  '/tiktok/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error, error_description } = req.query as Record<string, string>;
    const adminUrl = env.SOCIAL_ADMIN_URL ?? 'http://localhost:3003';

    if (error || !code) {
      return res.redirect(
        `${adminUrl}/accounts/tiktok?status=error&message=${encodeURIComponent(error_description ?? error ?? 'OAuth cancelled')}`,
      );
    }

    const codeVerifier = state ? consumePKCEForState(state) : undefined;
    if (!codeVerifier) {
      return res.redirect(
        `${adminUrl}/accounts/tiktok?status=error&message=${encodeURIComponent('OAuth session expired or invalid state. Please try again.')}`,
      );
    }

    try {
      const tokens = await exchangeCode(code, codeVerifier);

      const userRes = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username',
        { headers: { Authorization: `Bearer ${tokens.access_token}` } },
      );
      const userData = (await userRes.json()) as any;
      const user = userData?.data?.user ?? {};

      await SocialAccount.findOneAndUpdate(
        { platform: 'tiktok', platformUserId: tokens.open_id },
        {
          platform: 'tiktok',
          platformUserId: tokens.open_id,
          username: user.username || user.display_name || tokens.open_id,
          displayName: user.display_name,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          active: true,
        },
        { upsert: true, new: true },
      );

      return res.redirect(`${adminUrl}/accounts/tiktok?status=success`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return res.redirect(`${adminUrl}/accounts/tiktok?status=error&message=${encodeURIComponent(msg)}`);
    }
  }),
);

socialAccountsRouter.use(requireAuth);

socialAccountsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const accounts = await SocialAccount.find().sort({ createdAt: -1 }).lean();
    res.json({ items: accounts.map(accountToDto), total: accounts.length });
  }),
);

socialAccountsRouter.get(
  '/tiktok/auth-url',
  asyncHandler(async (_req, res) => {
    if (!env.TIKTOK_CLIENT_KEY) throw BadRequest('TIKTOK_CLIENT_KEY not configured');
    const state = crypto.randomBytes(16).toString('hex');
    const codeChallenge = storePKCEForState(state);
    const url = buildAuthUrl(state, codeChallenge);
    res.json({ url, state });
  }),
);

socialAccountsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const account = await SocialAccount.findByIdAndDelete(req.params.id);
    if (!account) throw NotFound('Account not found');
    res.status(204).end();
  }),
);

socialAccountsRouter.patch(
  '/:id/toggle',
  asyncHandler(async (req, res) => {
    const account = await SocialAccount.findById(req.params.id);
    if (!account) throw NotFound('Account not found');
    account.active = !account.active;
    await account.save();
    res.json(accountToDto(account.toObject()));
  }),
);

function accountToDto(a: any) {
  return {
    id: String(a._id),
    platform: a.platform,
    platformUserId: a.platformUserId,
    username: a.username,
    displayName: a.displayName,
    active: a.active,
    tokenExpiresAt: a.tokenExpiresAt ? new Date(a.tokenExpiresAt).toISOString() : undefined,
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
  };
}
