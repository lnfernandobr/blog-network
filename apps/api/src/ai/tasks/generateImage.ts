import { prompts, type ImagePromptInput } from '../prompts/index.js';
import { getImageProvider, getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

export interface GeneratedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Geração de imagem em duas etapas:
 * 1. Provider de TEXTO transforma o título em prompt visual + alt-text.
 * 2. Provider de IMAGEM converte o prompt em URL.
 *
 * Em mock, ambas as etapas são determinísticas.
 */
export async function generateImage(input: ImagePromptInput): Promise<GeneratedImage> {
  const text = getTextProvider();
  const promptResult = await text.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.image.system },
      { role: 'user', content: prompts.image.user(input) },
    ],
  });
  const parsed = parseJson<{ prompt?: string; alt?: string }>(promptResult.text);
  const visualPrompt = parsed.prompt ?? `Imagem editorial sobre ${input.title} no nicho ${input.niche}.`;
  const altText = parsed.alt ?? `Imagem ilustrativa: ${input.title.toLowerCase()}.`;

  const image = await getImageProvider().generateImage({
    prompt: visualPrompt,
    aspect: 'wide',
    seed: input.title,
  });
  return {
    url: image.url,
    alt: altText.slice(0, 200),
    width: image.width,
    height: image.height,
  };
}
