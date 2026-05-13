import { z } from 'zod';
import { getTextProvider } from '../../../ai/providers/index.js';
import type { SocialPipelineContext } from '../types.js';

const schema = z.object({
  topic: z.string().describe('Specific and catchy carousel topic (max 80 chars)'),
  angle: z.string().describe('Creative angle or hook for this carousel (max 120 chars)'),
});

export async function brainstormTopicStep(ctx: SocialPipelineContext): Promise<void> {
  const provider = await getTextProvider();
  const { campaign } = ctx;
  const cfg = campaign.promptConfig as any;

  const contentTypesList = cfg?.contentTypes?.length
    ? (cfg.contentTypes as string[]).join(', ')
    : 'educational, listicle';
  const tone = cfg?.tone ?? 'educational and inspiring';
  const audienceNote = cfg?.targetAudience ? `\nTarget audience: ${cfg.targetAudience}` : '';
  const extraNote = cfg?.extraContext ? `\nAdditional context: ${cfg.extraContext}` : '';

  const result = await provider.generateStructured({
    schemaName: 'BrainstormTopic',
    schema,
    messages: [
      {
        role: 'system',
        content: `You are a viral TikTok content strategist specializing in carousel posts.
Choose a specific, trending, and visually rich topic for a TikTok photo carousel.
Tone: ${tone}.
Preferred formats: ${contentTypesList}.
Always ask: "Would someone stop scrolling for this? Would they save it?"`,
      },
      {
        role: 'user',
        content: `Niche: ${campaign.niche}
Language: ${campaign.language}${audienceNote}${extraNote}

Generate ONE carousel topic using one of these formats: ${contentTypesList}.
Requirements:
- Specific (not "10 tips" but e.g. "7 silent signs your gut is inflamed" or "Before vs after stopping these 3 habits")
- Visual — each of the ${campaign.imageCount} slides must be illustratable as a distinct scene
- Stops the scroll — educational, myth-busting, before/after, transformational, or list-reveal

Return the topic title and a one-sentence creative angle that makes it irresistible.`,
      },
    ],
    temperature: 0.9,
  });

  ctx.topic = result.data.topic;
  ctx.topicAngle = result.data.angle;
}
