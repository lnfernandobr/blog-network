/**
 * Tipos compartilhados pela camada de IA.
 *
 * A interface aqui é intencionalmente mínima — qualquer provider novo
 * (Claude, OpenAI, Gemini) só precisa implementar `generateText` e,
 * opcionalmente, `generateImage`.
 *
 * Toda a lógica de produto (montar prompts, parsear JSON, escolher modelo
 * por task, etc.) vive nas tasks (./tasks) — providers ficam puros.
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateTextInput {
  /** Mensagens no formato unificado (system/user/assistant). */
  messages: AIMessage[];
  /**
   * Quando true, o provider deve forçar saída JSON parseável.
   * Em mock, retorna um objeto pré-fabricado conforme a task identificada
   * pelo header da primeira mensagem `user`.
   */
  jsonMode?: boolean;
  /** Override por chamada — útil pra usar Haiku em dev e Sonnet em prod. */
  model?: string;
  /** Limite de tokens; 0 ou undefined = padrão do provider. */
  maxTokens?: number;
  /** 0–1. Mais alto = mais criativo. */
  temperature?: number;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  provider: string;
  /** True quando o provider conseguiu produzir JSON parseável estritamente. */
  isJson?: boolean;
}

export interface GenerateImageInput {
  prompt: string;
  /** "wide" para 16:9 (cover), "square" para galerias. */
  aspect?: 'wide' | 'square' | 'portrait';
  /** Seed determinístico — útil em mock. */
  seed?: string;
}

export interface GenerateImageResult {
  url: string;
  alt: string;
  width: number;
  height: number;
  provider: string;
}

export interface AIProvider {
  /** Identificador curto: "mock" | "claude" | "openai". */
  readonly name: string;
  /** Indica se o provider está habilitado/configurado. Falso = não usar. */
  readonly enabled: boolean;
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateImage(input: GenerateImageInput): Promise<GenerateImageResult>;
}
