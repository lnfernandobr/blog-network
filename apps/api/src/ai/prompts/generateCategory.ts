import { jsonOutputContract } from './_shared.js';

export interface GenerateCategoryInput {
  title: string;
  excerpt: string;
  niche: string;
  /** Categorias já existentes no canal — preferir reutilizar. */
  existing: { slug: string; name: string }[];
}

const SYSTEM = `
Você organiza conteúdo editorial em categorias amplas (4-8 por canal no total).

REGRAS:
- PREFIRA reutilizar categoria existente se for compatível (mesmo que o ângulo seja levemente diferente). Múltiplas categorias com 1-2 posts cada poluem a navegação.
- Só crie categoria nova se o tema realmente não cabe em nenhuma das existentes.
- Slug em kebab-case, máx 25 chars. Nome curto e claro (1-3 palavras).
- Descrição: 100-200 chars descrevendo o tipo de conteúdo da categoria (não o post atual).
`;

export const generateCategoryPrompt = {
  name: 'generate-category',
  system: SYSTEM,
  user: (input: GenerateCategoryInput): string => {
    const lines: string[] = [];
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Título do post: ${input.title}`);
    lines.push(`Resumo: ${input.excerpt}`);
    lines.push('');
    lines.push('Categorias já existentes:');
    if (input.existing.length === 0) {
      lines.push('(nenhuma — pode criar a primeira)');
    } else {
      for (const c of input.existing) lines.push(`- ${c.slug} — ${c.name}`);
    }
    lines.push('');
    lines.push('Decida: reutilizar uma existente OU criar uma nova.');
    lines.push(
      jsonOutputContract({
        slug: 'kebab-case',
        name: 'Nome curto (1-3 palavras)',
        description: 'Descrição da categoria, 100-200 chars',
        reusedExisting: 'true se você está reutilizando categoria já existente',
      }),
    );
    return lines.join('\n');
  },
};
