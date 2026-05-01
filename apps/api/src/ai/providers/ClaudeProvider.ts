import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';

/**
 * ClaudeProvider — esqueleto.
 *
 * Quando ANTHROPIC_API_KEY estiver presente, substituir o corpo de
 * `generateText` por `new Anthropic({ apiKey }).messages.create({...})`.
 *
 * Mantemos o stub aqui pra deixar o ponto de troca explícito e tipado.
 */
export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';
  readonly enabled: boolean;
  readonly model: string;

  constructor(opts: { apiKey?: string; model?: string }) {
    this.enabled = Boolean(opts.apiKey);
    this.model = opts.model || 'claude-sonnet-4-6';
  }

  async generateText(_input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.enabled) throw new Error('ClaudeProvider not configured (missing ANTHROPIC_API_KEY)');
    throw new Error('ClaudeProvider not implemented yet — switch AI_PROVIDER=mock for now');
  }

  async generateImage(_input: GenerateImageInput): Promise<GenerateImageResult> {
    // Anthropic não gera imagens — pode delegar para um image provider separado.
    throw new Error('ClaudeProvider does not support image generation');
  }
}
