import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import type { AIProvider } from '../types.js';
import { ClaudeProvider } from './ClaudeProvider.js';
import { MockProvider } from './MockProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';

let textProvider: AIProvider | null = null;
let imageProvider: AIProvider | null = null;

/**
 * Resolve o provider de TEXTO ativo no momento.
 * Cai pra mock se o configurado não estiver habilitado (chave faltando, etc.).
 *
 * O factory cacheia a escolha em memória — em testes, chame `__resetAIProviders()`.
 */
export function getTextProvider(): AIProvider {
  if (textProvider) return textProvider;

  let candidate: AIProvider;
  switch (env.AI_PROVIDER) {
    case 'claude':
      candidate = new ClaudeProvider({ apiKey: env.ANTHROPIC_API_KEY, model: env.AI_MODEL });
      break;
    case 'openai':
      candidate = new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, model: env.AI_MODEL });
      break;
    case 'mock':
    default:
      candidate = new MockProvider();
      break;
  }

  if (!candidate.enabled) {
    logger.warn(
      { configured: env.AI_PROVIDER },
      'AI provider configurado não está habilitado; caindo para mock',
    );
    candidate = new MockProvider();
  }

  textProvider = candidate;
  logger.info({ provider: textProvider.name }, 'AI text provider ready');
  return textProvider;
}

/**
 * Provider de IMAGEM. Hoje só o mock gera. Quando OpenAI/Imagen entrar,
 * a lógica fica aqui — sem afetar tasks.
 */
export function getImageProvider(): AIProvider {
  if (imageProvider) return imageProvider;
  imageProvider = new MockProvider();
  logger.info({ provider: imageProvider.name }, 'AI image provider ready');
  return imageProvider;
}

export function __resetAIProviders(): void {
  textProvider = null;
  imageProvider = null;
}
