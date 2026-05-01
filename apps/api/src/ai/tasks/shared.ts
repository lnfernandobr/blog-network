/**
 * Helpers compartilhados entre tasks.
 * Mantemos pequenos e sem dependências externas — qualquer coisa
 * mais sofisticada deve nascer como módulo dedicado.
 */

export function parseJson<T>(text: string): T {
  // Tenta JSON puro; se vier embrulhado em ```json ... ```, extrai.
  const direct = tryParse<T>(text);
  if (direct !== undefined) return direct;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    const inner = tryParse<T>(fenced[1]);
    if (inner !== undefined) return inner;
  }
  throw new Error(`AI response is not parseable JSON: ${text.slice(0, 120)}…`);
}

function tryParse<T>(s: string): T | undefined {
  try {
    return JSON.parse(s.trim()) as T;
  } catch {
    return undefined;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
