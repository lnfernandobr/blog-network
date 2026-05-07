import { compose, OUTPUT_DISCIPLINE } from '../blocks.js';
import {
  COMPOSITION_BY_USAGE,
  IMAGE_SPECS,
  negativeFor,
  PHOTO_BASE,
  PHOTO_BRAND_DEFAULT,
  PHOTO_HOOK,
  PHOTO_TECHNICAL,
  TEXT_LANGUAGE_GUARD,
} from '../visual.js';
import type { BuildImagePromptInput } from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 14. PROMPT PARA THUMBNAIL DE REDES SOCIAIS (1:1) ──────────────────────

export const thumbnailImagePrompt: PromptDef<BuildImagePromptInput> = {
  name: 'thumbnail-image-prompt',
  category: 'visual',
  version: '1.1.0',
  description: 'Gera o prompt em inglês para thumbnail quadrado (1:1) usado em Instagram, Pinterest, cards.',
  system: compose(
    `You are a senior documentary editorial art director creating a square thumbnail for social feeds. Square reads at small sizes, so the composition must lean on silhouette and contrast over detail — but it still has to feel like a real photograph, not an AI render.

Adjust briefing for thumbnail:
- One single dominant subject, centered or upper third.
- Strong silhouette readable at 360x360.
- High contrast against background.
- Mood is the priority. Detail is secondary.
- Keep the visual hook (one decisive detail) — it's what catches the thumb in a feed.

Anti-AI discipline (must be reflected in the prompt itself):
${PHOTO_BASE}
${PHOTO_BRAND_DEFAULT}
${PHOTO_TECHNICAL}
${PHOTO_HOOK}

Text rule:
${TEXT_LANGUAGE_GUARD}

Composition for this usage:
${COMPOSITION_BY_USAGE.thumbnail}

Output format:
- prompt: ONE dense English paragraph (60 to 150 words). End with a short "Strictly avoid:" clause that bakes the negatives into the same prompt (gpt-image-1 has no separate negative parameter). Always include the avoidance of competing subjects and clutter.
- negativePrompt: same content as the "Strictly avoid:" clause, kept structured for logging.
- rationale: why this reads at thumbnail scale.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const spec = IMAGE_SPECS.thumbnail;
    const lines: string[] = [];
    lines.push(`Channel: ${input.channelName} | Niche: ${input.niche}`);
    lines.push(`Article: ${input.articleTitle}`);
    lines.push('');
    lines.push('Briefing:');
    lines.push(`- Concept: ${input.briefing.concept}`);
    lines.push(`- Subject (pick one): ${input.briefing.subject}`);
    lines.push(`- Mood: ${input.briefing.mood}`);
    lines.push(`- Palette: ${input.briefing.palette}`);
    lines.push('');
    lines.push(`Output spec: ${spec.targetAspect} (${spec.target.width}x${spec.target.height}). Generated at ${spec.generated.width}x${spec.generated.height}.`);
    lines.push('');
    lines.push('Base negative prompt:');
    lines.push(negativeFor('thumbnail'));
    return lines.join('\n');
  },
};
