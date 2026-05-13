import path from 'node:path';
import { getImageProvider } from '../../../ai/providers/index.js';
import { logger } from '../../../config/logger.js';
import { uploadsDir } from '../../../services/uploads.js';
import type { SocialPipelineContext, SocialPostImage } from '../types.js';

/**
 * Extracts the on-disk path from an /uploads/ URL. The provider already saved
 * the image via saveImageBuffer() — we just reconstruct the path.
 */
function localPathFromUploadsUrl(url: string): string | undefined {
  const match = url.match(/\/uploads\/([^/?#]+)$/);
  if (!match) return undefined;
  return path.join(uploadsDir(), match[1]!);
}

export async function generateImagesStep(ctx: SocialPipelineContext): Promise<void> {
  const provider = await getImageProvider();
  const rawPrompts = ctx.imagePrompts ?? [];

  if (rawPrompts.length === 0) throw new Error('No image prompts available');

  const images: SocialPostImage[] = [];

  for (let i = 0; i < rawPrompts.length; i++) {
    const raw = rawPrompts[i]!;
    let prompt: string;
    let alt: string;

    try {
      const parsed = JSON.parse(raw) as { prompt: string; alt: string };
      prompt = parsed.prompt;
      alt = parsed.alt;
    } catch {
      prompt = raw;
      alt = `Slide ${i + 1} — ${ctx.topic ?? ''}`.slice(0, 100);
    }

    logger.info({ slide: i + 1, total: rawPrompts.length }, 'generating carousel image');

    const result = await provider.generateImage({ prompt, aspect: 'portrait' });

    // The image provider (OpenAI/Claude) already saved the bytes to /uploads/
    // and returned the persistent public URL. We just need the disk path
    // for fast local reads when uploading to TikTok.
    images.push({
      url: result.url,
      localPath: localPathFromUploadsUrl(result.url),
      alt,
      width: result.width,
      height: result.height,
      prompt,
    });
  }

  ctx.images = images;
}
