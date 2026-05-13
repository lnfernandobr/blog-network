import { z } from 'zod';
import { getTextProvider } from '../../../ai/providers/index.js';
import type { SocialPipelineContext } from '../types.js';

const schema = z.object({
  prompts: z.array(
    z.object({
      prompt: z
        .string()
        .describe(
          'Detailed DALL-E image generation prompt. Photorealistic, vibrant, portrait orientation. Describe subject, lighting, mood, style. Max 300 chars.',
        ),
      alt: z.string().describe('Short alt text for accessibility (max 100 chars)'),
    }),
  ),
});

export async function generateImagePromptsStep(ctx: SocialPipelineContext): Promise<void> {
  const provider = await getTextProvider();
  const { campaign } = ctx;
  const count = campaign.imageCount ?? 5;
  const cfg = campaign.promptConfig as any;

  const visualStyle = cfg?.visualStyle ?? 'vibrant editorial photography, high contrast, cinematic lighting';
  const extraNote = cfg?.extraContext ? `\nBrand context: ${cfg.extraContext}` : '';

  const result = await provider.generateStructured({
    schemaName: 'GenerateImagePrompts',
    schema,
    messages: [
      {
        role: 'system',
        content: `You are a visual director creating DALL-E image prompts for a TikTok carousel.
Visual style for ALL slides: ${visualStyle}. Portrait orientation 9:16. No text in images.
Narrative arc: slide 1 = attention-grabbing hook image, slides 2-${count - 1} = progressive content, slide ${count} = satisfying conclusion or call-to-action visual.
Each prompt MUST specify: subject, lighting, mood, composition, color palette. Be specific enough that DALL-E produces a consistent editorial series.`,
      },
      {
        role: 'user',
        content: `Topic: ${ctx.topic}
Angle: ${ctx.topicAngle}
Niche: ${campaign.niche}
Visual style: ${visualStyle}
Number of slides: ${count}${extraNote}

Generate exactly ${count} DALL-E prompts, one per carousel slide.
- Each slide illustrates a DIFFERENT aspect of the topic
- All slides must feel like one cohesive editorial shoot
- Prompts must be detailed (subject + lighting + mood + style), max 280 chars each
- Include the visual style descriptor in every prompt for consistency`,
      },
    ],
    temperature: 0.85,
  });

  ctx.imagePrompts = result.data.prompts.slice(0, count).map((p) => JSON.stringify(p));
}
