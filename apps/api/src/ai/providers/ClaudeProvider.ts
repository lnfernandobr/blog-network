import Anthropic from '@anthropic-ai/sdk';
import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Provider de texto via Anthropic Messages API.
 *
 * Detalhes do design:
 * - System prompt vai com `cache_control: ephemeral` quando >= ~500 tokens
 *   (regras editoriais + SEO/GEO). Reduz custo em ~90% em chamadas seguintes
 *   dentro de 5 minutos.
 * - jsonMode: instrui o modelo via system prompt a responder só com JSON;
 *   sanitiza eventuais cercas markdown (```json ... ```) na resposta.
 *   Não usamos prefill de assistant (`{`) porque modelos com extended
 *   thinking — ex: claude-opus-4-7 — rejeitam mensagens que terminam em
 *   role=assistant.
 * - Não suporta image — `generateImage` lança erro. Use OpenAIProvider
 *   pra imagem.
 */
export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';
  readonly enabled: boolean;
  readonly model: string;

  private client?: Anthropic;

  constructor(opts: { apiKey?: string; model?: string }) {
    this.enabled = Boolean(opts.apiKey);
    this.model = opts.model || DEFAULT_MODEL;
    if (this.enabled && opts.apiKey) {
      this.client = new Anthropic({ apiKey: opts.apiKey });
    }
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.client) throw new Error('ClaudeProvider not configured (missing ANTHROPIC_API_KEY)');

    const systemMsgs = input.messages.filter((m) => m.role === 'system');
    const conversation = input.messages.filter((m) => m.role !== 'system');

    let systemText = systemMsgs.map((m) => m.content).join('\n\n');
    if (input.jsonMode) {
      systemText +=
        '\n\nFormato obrigatório de saída: responda APENAS com um JSON válido, sem nenhum texto antes ou depois, sem cercas de código markdown (sem ```), começando com `{` e terminando com `}`.';
    }
    const cacheable = systemText.length > 2000;
    const system = cacheable
      ? [{ type: 'text' as const, text: systemText, cache_control: { type: 'ephemeral' as const } }]
      : systemText;

    const messages: Anthropic.MessageParam[] = conversation.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const model = input.model || this.model;
    const response = await this.client.messages.create({
      model,
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: input.temperature ?? DEFAULT_TEMPERATURE,
      system,
      messages,
    });

    const block = response.content.find((c): c is Anthropic.TextBlock => c.type === 'text');
    let text = block?.text ?? '';

    if (input.jsonMode) {
      // Stripa cercas markdown (```json ... ``` ou ``` ... ```) caso o
      // modelo tenha incluído mesmo com instrução em contrário.
      text = text.trim();
      const fence = /^```(?:json)?\s*\n([\s\S]*?)\n?```\s*$/;
      const m = fence.exec(text);
      if (m) text = m[1]!.trim();
    }

    return {
      provider: this.name,
      model,
      text,
      isJson: !!input.jsonMode,
    };
  }

  async generateImage(_input: GenerateImageInput): Promise<GenerateImageResult> {
    throw new Error(
      'ClaudeProvider does not support image generation. Use OpenAIProvider for images.',
    );
  }
}
