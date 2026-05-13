import { SocialAccount } from '../../../models/SocialAccount.js';
import { SocialPost } from '../../../models/SocialPost.js';
import { postPhotoCarousel, refreshAccessToken } from '../../../services/tiktok.js';
import { logger } from '../../../config/logger.js';
import type { SocialPipelineContext } from '../types.js';

export async function postToTiktokStep(ctx: SocialPipelineContext): Promise<void> {
  const { campaign } = ctx;

  const account = await SocialAccount.findById(campaign.accountId);
  if (!account) throw new Error(`Social account ${campaign.accountId} not found`);
  if (!account.active) throw new Error('Social account is inactive');

  let accessToken = account.accessToken;

  // Refresh token if expired or about to expire (within 10 min)
  if (
    account.tokenExpiresAt &&
    account.refreshToken &&
    new Date(account.tokenExpiresAt).getTime() - Date.now() < 10 * 60 * 1000
  ) {
    logger.info({ accountId: String(account._id) }, 'refreshing TikTok access token');
    const refreshed = await refreshAccessToken(account.refreshToken);
    account.accessToken = refreshed.access_token;
    account.refreshToken = refreshed.refresh_token;
    account.tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
    accessToken = refreshed.access_token;
    await account.save();
  }

  if (!ctx.images || ctx.images.length === 0) throw new Error('No images to post');
  if (!ctx.post) throw new Error('SocialPost document not created yet');

  const result = await postPhotoCarousel(accessToken, {
    caption: ctx.caption ?? '',
    hashtags: ctx.hashtags ?? [],
    images: ctx.images.map((img) => ({ url: img.url, localPath: img.localPath })),
  });

  await SocialPost.findByIdAndUpdate(ctx.post._id, {
    platformPostId: result.publishId,
    platformShareUrl: result.shareUrl,
    status: 'pending_review',
  });

  // Update context post reference
  if (ctx.post) {
    (ctx.post as any).platformPostId = result.publishId;
    (ctx.post as any).platformShareUrl = result.shareUrl;
    (ctx.post as any).status = 'pending_review';
  }

  logger.info(
    { publishId: result.publishId, shareUrl: result.shareUrl },
    'carousel posted to TikTok as private draft',
  );
}
