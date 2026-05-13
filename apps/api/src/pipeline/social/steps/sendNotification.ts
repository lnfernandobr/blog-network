import { SocialPost } from '../../../models/SocialPost.js';
import { sendEmail, buildCarouselEmailHtml } from '../../../services/resend.js';
import { logger } from '../../../config/logger.js';
import type { SocialPipelineContext } from '../types.js';

export async function sendNotificationStep(ctx: SocialPipelineContext): Promise<void> {
  const { campaign } = ctx;

  if (!ctx.post) throw new Error('No post to notify about');

  const post = await SocialPost.findById(ctx.post._id).lean();
  if (!post) throw new Error('Post not found for notification');

  const html = buildCarouselEmailHtml({
    topic: ctx.topic ?? '',
    caption: ctx.caption ?? '',
    hashtags: ctx.hashtags ?? [],
    images: (ctx.images ?? []).map((img) => ({ url: img.url, alt: img.alt })),
    platformShareUrl: (post as any).platformShareUrl,
    campaignName: campaign.name,
  });

  await sendEmail({
    to: campaign.notificationEmail,
    subject: `TikTok post ready for review — ${ctx.topic ?? 'new carousel'}`,
    html,
  });

  await SocialPost.findByIdAndUpdate(ctx.post._id, {
    notificationSentAt: new Date(),
  });

  logger.info({ email: campaign.notificationEmail, postId: String(ctx.post._id) }, 'notification sent');
}
