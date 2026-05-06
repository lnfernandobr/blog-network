import { z } from 'zod';
import { logger } from '../../config/logger.js';

/**
 * Validação Zod defensiva.
 *
 * Se a primeira validação falhar exclusivamente por strings excedendo `max`,
 * tenta truncar os campos ofensivos e re-validar. Outros erros (campo
 * faltando, tipo errado, enum inválido) lançam imediatamente.
 *
 * Motivo: providers às vezes excedem max_length declarado no JSON Schema
 * (Anthropic tool input_schema é hint, não constraint estrita; OpenAI strict
 * é melhor mas também falha em inputs longos). O retry de truncamento
 * preserva o conteúdo essencial em vez de derrubar o pipeline inteiro.
 *
 * Falhas estruturais reais (tipo ou enum) nunca passam, garantindo que o
 * pipeline ainda quebre quando o problema é semântico.
 */
export function safeParseStructured<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  context: { schemaName: string; provider: string },
): T {
  const first = schema.safeParse(raw);
  if (first.success) return first.data;

  const tooBigPaths = first.error.issues
    .filter((i) => i.code === 'too_big' && i.origin === 'string')
    .map((i) => ({ path: i.path, max: (i as z.core.$ZodIssueTooBig).maximum as number }));

  const otherErrors = first.error.issues.filter(
    (i) => !(i.code === 'too_big' && i.origin === 'string'),
  );

  if (tooBigPaths.length === 0 || otherErrors.length > 0) {
    // Erro estrutural ou misto. Não dá pra resgatar via truncamento.
    throw new Error(
      `[${context.provider}] schema "${context.schemaName}" inválido: ${JSON.stringify(first.error.issues)}`,
    );
  }

  // Tenta resgatar truncando os campos string ofensivos.
  const cloned = JSON.parse(JSON.stringify(raw));
  for (const { path, max } of tooBigPaths) {
    truncateAt(cloned, path, max);
  }

  const second = schema.safeParse(cloned);
  if (!second.success) {
    throw new Error(
      `[${context.provider}] schema "${context.schemaName}" ainda inválido após truncar: ${JSON.stringify(second.error.issues)}`,
    );
  }

  logger.warn(
    {
      schemaName: context.schemaName,
      provider: context.provider,
      truncated: tooBigPaths.length,
      paths: tooBigPaths.map((t) => t.path.join('.')),
    },
    'structured output excedeu max_length em alguns campos. Truncado e aceito.',
  );

  return second.data;
}

function truncateAt(obj: unknown, path: PropertyKey[], max: number): void {
  if (path.length === 0) return;
  let cur: any = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (cur == null) return;
    cur = cur[path[i]!];
  }
  const last = path[path.length - 1]!;
  if (cur == null) return;
  const val = cur[last];
  if (typeof val === 'string' && val.length > max) {
    // Mantém o final cortado em palavra quando possível.
    const truncated = val.slice(0, max);
    const lastSpace = truncated.lastIndexOf(' ');
    cur[last] = lastSpace > max - 80 ? truncated.slice(0, lastSpace) : truncated;
  }
}
