import { EDITORIAL_RULES, SEO_GEO_RULES, jsonOutputContract } from './_shared.js';

export interface OutlineArticleInput {
  refinedTitle: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  intent: string;
  format: string;
  audienceLevel: string;
  niche: string;
  language: string;
  channelName: string;
}

const SYSTEM = `
Você é o editor que define a ESTRUTURA do artigo antes de qualquer linha ser escrita. Bom outline = bom artigo. Mau outline = artigo genérico que vira fluff.

REGRAS DO OUTLINE:
- Liste H2s na ORDEM em que aparecem. Cada H2 é uma promessa concreta de valor.
- Para cada H2, declare o QUE PRECISA ESTAR PRESENTE: dados, exemplos específicos, comparações, tabelas, números.
- Inclua pelo menos UMA tabela ou lista numerada se o tema permitir (ajuda em featured snippets e citação por LLMs).
- Inclua FAQ ao final com 3-5 perguntas REAIS que o leitor faria depois de ler.
- Hook (1º parágrafo): tese forte ou número/dado surpreendente. Sem "neste artigo vamos…".

${EDITORIAL_RULES}

${SEO_GEO_RULES}
`;

export const outlineArticlePrompt = {
  name: 'outline-article',
  system: SYSTEM,
  user: (input: OutlineArticleInput): string => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName}`);
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Idioma: ${input.language}`);
    lines.push(`Título: ${input.refinedTitle}`);
    lines.push(`Palavra-chave principal: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) {
      lines.push(`Palavras-chave secundárias: ${input.secondaryKeywords.join(', ')}`);
    }
    lines.push(`Intenção: ${input.intent}`);
    lines.push(`Formato: ${input.format}`);
    lines.push(`Nível do público: ${input.audienceLevel}`);
    lines.push('');
    lines.push('Crie um outline detalhado.');
    lines.push(
      jsonOutputContract({
        hook: 'Frase de abertura (1-2 frases) com dado/tese forte',
        sections: [
          {
            h2: 'Heading da seção (curto, declarativo)',
            answerFirst: '1-2 frases que respondem direto a pergunta da seção',
            mustInclude: [
              'item específico que precisa aparecer (número, exemplo, comparação)',
              'outro item',
            ],
            h3s: ['subseção opcional 1', 'subseção opcional 2'],
            useTable: false,
            useNumberedList: false,
          },
        ],
        faq: [
          {
            question: 'Pergunta real que leitor faria',
            answerHint: 'O que a resposta deve cobrir (1 frase guia)',
          },
        ],
        wordCountTarget: 'integer entre 800-1500 dependendo do formato',
      }),
    );
    return lines.join('\n');
  },
};
