import { jsonOutputContract } from './_shared.js';

export interface BrainstormTopicsInput {
  channelName: string;
  niche: string;
  language: string;
  /** Slugs dos últimos 30-50 posts publicados — pra não repetir tema. */
  recentSlugs?: string[];
  /** Categorias existentes — útil pra balancear cobertura. */
  existingCategories?: { slug: string; name: string }[];
}

const SYSTEM = `
Você é um editor-chefe de blog de nicho. Sua tarefa é gerar candidatos de pauta diversificados em ângulo e intenção, considerando o que já foi publicado e o que o público desse nicho realmente busca.

CRITÉRIOS DE QUALIDADE:
- Cada candidato deve ter ÂNGULO único (formato, ponto de vista, recorte do tema). Evite 5 variações da mesma pergunta.
- Diversifique INTENÇÃO: misture informacional ("o que é"), comparativo ("X vs Y"), how-to ("como fazer"), opinião/curadoria ("o melhor para Z"), troubleshooting ("por que meu X falha").
- Diversifique NÍVEL: alguns para iniciante, alguns para intermediário/avançado.
- Pense em LONG TAIL: temas específicos (3-5 palavras) ranqueiam mais fácil que termos genéricos.
- EVITE temas que já apareceram nos slugs recentes ou são quase a mesma coisa com palavras diferentes.
- Para cada candidato, declare o GAP que ele preenche e a INTENÇÃO de busca primária.
`;

export const brainstormTopicsPrompt = {
  name: 'brainstorm-topics',
  system: SYSTEM,
  user: (input: BrainstormTopicsInput): string => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName}`);
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Idioma: ${input.language}`);
    lines.push(`Ano corrente: ${new Date().getFullYear()}`);
    lines.push('');
    if (input.existingCategories?.length) {
      lines.push('Categorias existentes (balanceie a cobertura):');
      for (const c of input.existingCategories) lines.push(`- ${c.name} (${c.slug})`);
      lines.push('');
    }
    if (input.recentSlugs?.length) {
      lines.push('Slugs já publicados nos últimos meses (NÃO repita tema/ângulo):');
      for (const s of input.recentSlugs.slice(0, 50)) lines.push(`- ${s}`);
      lines.push('');
    }
    lines.push('Gere de 8 a 10 candidatos diversificados em ângulo, intenção e nível.');
    lines.push(
      jsonOutputContract({
        candidates: [
          {
            workingTitle: 'Título de trabalho 60-90 chars (pode refinar depois)',
            angle: 'Recorte/ângulo único em 1 frase',
            intent: 'informational | comparison | how-to | opinion | troubleshooting | review',
            audienceLevel: 'beginner | intermediate | advanced',
            format: 'article | how-to | list | review | opinion',
            primaryKeyword: 'palavra-chave principal (long-tail preferida)',
            secondaryKeywords: ['kw 1', 'kw 2'],
            gapFilled: 'Por que esse tema preenche um gap (vs slugs recentes)',
            valueDelivered: 'O que o leitor sai sabendo/conseguindo fazer ao terminar',
          },
        ],
      }),
    );
    return lines.join('\n');
  },
};
