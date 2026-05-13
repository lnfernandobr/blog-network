import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface SendEmailOpts {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOpts): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not set — skipping email notification');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL ?? 'Social Automation <noreply@yourdomain.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error({ status: res.status, body }, 'resend email failed');
    throw new Error(`Resend API error: ${res.status}`);
  }

  logger.info({ to: opts.to, subject: opts.subject }, 'notification email sent');
}

export function buildCarouselEmailHtml(opts: {
  topic: string;
  caption: string;
  hashtags: string[];
  images: { url: string; alt: string }[];
  platformShareUrl?: string;
  campaignName: string;
}): string {
  const imageGrid = opts.images
    .slice(0, 6)
    .map(
      (img) =>
        `<img src="${img.url}" alt="${img.alt}" width="160" height="213" style="border-radius:8px;object-fit:cover;display:inline-block;margin:4px;" />`,
    )
    .join('');

  const hashtagsHtml = opts.hashtags
    .slice(0, 20)
    .map((h) => `<span style="color:#fe2c55;margin-right:6px;">#${h.replace(/^#/, '')}</span>`)
    .join('');

  const tiktokButton = opts.platformShareUrl
    ? `<a href="${opts.platformShareUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#fe2c55;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View on TikTok</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fafafa;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#18181b;border-radius:12px;overflow:hidden;">
    <div style="background:#fe2c55;padding:24px 32px;">
      <h1 style="margin:0;font-size:20px;color:#fff;">📱 TikTok post ready for review</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Campaign: ${opts.campaignName}</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;font-size:16px;color:#a1a1aa;font-weight:500;text-transform:uppercase;letter-spacing:.05em;">Topic</h2>
      <p style="margin:0 0 24px;font-size:18px;font-weight:600;">${opts.topic}</p>

      <h2 style="margin:0 0 8px;font-size:16px;color:#a1a1aa;font-weight:500;text-transform:uppercase;letter-spacing:.05em;">Caption</h2>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;background:#27272a;border-radius:8px;padding:16px;">${opts.caption}</p>

      <h2 style="margin:0 0 12px;font-size:16px;color:#a1a1aa;font-weight:500;text-transform:uppercase;letter-spacing:.05em;">Images (${opts.images.length})</h2>
      <div style="margin-bottom:24px;">${imageGrid}</div>

      <h2 style="margin:0 0 8px;font-size:16px;color:#a1a1aa;font-weight:500;text-transform:uppercase;letter-spacing:.05em;">Hashtags</h2>
      <p style="margin:0 0 24px;font-size:13px;line-height:1.8;">${hashtagsHtml}</p>

      <div style="border-top:1px solid #27272a;padding-top:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;">
          The post has been uploaded to TikTok as <strong style="color:#fafafa;">private</strong>.
          Open TikTok, find it in your private posts, add music, and publish when ready.
        </p>
        ${tiktokButton}
      </div>
    </div>
  </div>
</body>
</html>`;
}
