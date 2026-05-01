import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';

/**
 * OpenAIProvider — esqueleto.
 *
 * Quando OPENAI_API_KEY estiver presente, plugar `OpenAI` SDK aqui.
 * Especialmente útil pra `generateImage` (DALL·E 3 / gpt-image-1).
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly enabled: boolean;
  readonly model: string;

  constructor(opts: { apiKey?: string; model?: string }) {
    this.enabled = Boolean(opts.apiKey);
    this.model = opts.model || 'gpt-4.1-mini';
  }

  async generateText(_input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.enabled) throw new Error('OpenAIProvider not configured (missing OPENAI_API_KEY)');
    throw new Error('OpenAIProvider not implemented yet — switch AI_PROVIDER=mock for now');
  }

  async generateImage(_input: GenerateImageInput): Promise<GenerateImageResult> {
    if (!this.enabled) throw new Error('OpenAIProvider not configured (missing OPENAI_API_KEY)');
    throw new Error('OpenAIProvider image generation not implemented yet');
  }
}
