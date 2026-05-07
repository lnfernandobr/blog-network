import { getImageProvider } from '../providers/index.js';

export interface GenerateImageInput {
  /** Prompt visual já refinado (vem da skill generateImagePromptBrief). */
  prompt: string;
  alt: string;
  /**
   * Negative prompt em camadas. gpt-image-1 não aceita negativo separado,
   * então injetamos como "Strictly avoid:" no final do prompt principal.
   * Opcional pra manter compat com chamadas antigas.
   */
  negativePrompt?: string;
  /** Seed determinístico — útil em mock. */
  seed?: string;
}

/**
 * Junta prompt + negative numa única string, sem duplicar caso o LLM já tenha
 * incluído a cláusula "Strictly avoid:" no prompt gerado.
 */
function mergePromptWithNegatives(prompt: string, negative?: string): string {
  const neg = negative?.trim();
  if (!neg) return prompt;
  if (/strictly avoid\s*:/i.test(prompt)) return prompt;
  return `${prompt.trim()}\n\nStrictly avoid: ${neg}`;
}

export interface GeneratedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  provider: string;
}

/**
 * Converte um brief visual já elaborado em URL real de imagem.
 *
 * Diferente da versão antiga, essa skill NÃO chama mais o provider de texto
 * pra gerar o prompt — o brief vem pronto da skill `generateImagePromptBrief`,
 * que separa concerns: 1 prompt = 1 LLM call.
 */
export async function generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
  const provider = await getImageProvider();
  const finalPrompt = mergePromptWithNegatives(input.prompt, input.negativePrompt);
  const image = await provider.generateImage({
    prompt: finalPrompt,
    aspect: 'wide',
    seed: input.seed ?? finalPrompt.slice(0, 40),
  });
  return {
    url: image.url,
    alt: input.alt.slice(0, 200),
    width: image.width,
    height: image.height,
    provider: image.provider,
  };
}
