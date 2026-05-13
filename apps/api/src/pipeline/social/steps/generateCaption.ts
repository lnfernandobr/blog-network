import { z } from 'zod';
import { getTextProvider } from '../../../ai/providers/index.js';
import type { SocialPipelineContext } from '../types.js';

const schema = z.object({
  caption: z
    .string()
    .describe('TikTok caption (150-280 chars). Engaging, with 1-2 emojis. No hashtags here.'),
  hashtags: z
    .array(z.string())
    .describe('15-25 relevant hashtags WITHOUT the # symbol, ordered by relevance'),
});

export async function generateCaptionStep(ctx: SocialPipelineContext): Promise<void> {
  const provider = await getTextProvider();
  const { campaign } = ctx;
  const cfg = campaign.promptConfig as any;

  const tone = cfg?.tone ?? 'educational and inspiring';
  const audienceNote = cfg?.targetAudience ? `\nTarget audience: ${cfg.targetAudience}` : '';
  const extraNote = cfg?.extraContext ? `\nBrand context: ${cfg.extraContext}` : '';

  const result = await provider.generateStructured({
    schemaName: 'GenerateCaption',
    schema,
    messages: [
      {
        role: 'system',
        content: `You are a TikTok copywriter who writes high-converting captions.
Tone: ${tone}. Captions must feel human, direct, and personal — never corporate or AI-generated.
Hashtag strategy: 3-5 niche-specific (under 100k posts), 5-8 mid-range (100k–1M), 5-10 broad (>1M).
Write ONLY in the specified language. Zero filler phrases like "dive in" or "let's explore".`,
      },
      {
        role: 'user',
        content: `Niche: ${campaign.niche}
Language: ${campaign.language}
Topic: ${ctx.topic}
Angle: ${ctx.topicAngle}${audienceNote}${extraNote}

Write the TikTok caption and hashtags.

Caption rules:
- First line is the hook — a bold statement, shocking stat, or direct question (max 120 chars)
- Body: 1-2 sentences reinforcing the value
- End with a soft CTA ("Save this", "Follow for more", "Comment your thoughts")
- 150-280 chars total, 1-2 emojis max, NO hashtags in caption

Hashtags: return words only, no # prefix, ordered strongest first.`,
      },
    ],
    temperature: 0.8,
  });

  ctx.caption = result.data.caption;
  ctx.hashtags = result.data.hashtags;
}
