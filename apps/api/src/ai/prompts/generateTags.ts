import { jsonOutputContract } from './_shared.js';

export interface GenerateTagsInput {
  title: string;
  excerpt: string;
  niche: string;
  contentExcerpt?: string;
  /** Tags existentes no canal — pra reutilizar quando faz sentido. */
  existingTags?: string[];
}

const SYSTEM = `
Você extrai 3-6 tags pra SEO interno e descoberta.

REGRAS:
- kebab-case, sem acentos, sem stopwords ("o", "a", "para").
- Reutilize tags existentes do canal sempre que possível (cluster de conteúdo).
- Não repita o título inteiro como tag.
- Não use plural óbvio se a versão singular já existe (e vice-versa).
- Mistura: 1-2 tags amplas (ex: "v60", "espresso") + 2-3 específicas do post (ex: "moagem-fina", "agua-94c") + 1 contextual quando faz sentido (ex: "iniciante").
`;

export const generateTagsPrompt = {
  name: 'generate-tags',
  system: SYSTEM,
  user: (input: GenerateTagsInput): string => {
    const lines: string[] = [];
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Título: ${input.title}`);
    lines.push(`Resumo: ${input.excerpt}`);
    if (input.contentExcerpt) {
      lines.push('');
      lines.push('Trecho do conteúdo:');
      lines.push(input.contentExcerpt);
    }
    if (input.existingTags?.length) {
      lines.push('');
      lines.push('Tags existentes no canal (reutilize quando fizer sentido):');
      lines.push(input.existingTags.slice(0, 50).join(', '));
    }
    lines.push('');
    lines.push(jsonOutputContract({ tags: ['tag-1', 'tag-2', 'tag-3'] }));
    return lines.join('\n');
  },
};
