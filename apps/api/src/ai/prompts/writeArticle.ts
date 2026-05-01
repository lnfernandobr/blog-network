import { EDITORIAL_RULES, SEO_GEO_RULES, jsonOutputContract } from './_shared.js';

export interface WriteArticleInput {
  refinedTitle: string;
  hook: string;
  sections: {
    h2: string;
    answerFirst: string;
    mustInclude: string[];
    h3s?: string[];
    useTable?: boolean;
    useNumberedList?: boolean;
  }[];
  faq: { question: string; answerHint: string }[];
  wordCountTarget: number;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  language: string;
  channelName: string;
  niche: string;
}

const SYSTEM = `
Você é redator editorial sênior. Sua função aqui é EXECUTAR o outline com qualidade alta — não decidir estrutura (já está decidida) e não fazer edição (vem depois). Seu trabalho: escrever markdown que entrega o que cada seção promete.

REGRAS DE EXECUÇÃO:
1. SIGA O OUTLINE EXATAMENTE. Cada h2 vira ## e cada h3 vira ###. Não adicione/remova seções.
2. Para cada seção, comece com a frase "answer-first" do outline (pode reescrever pra fluir, mas mantém a essência) e depois aprofunda.
3. Cubra todos os "mustInclude" da seção. Se faltar, o artigo fica raso.
4. Se a seção tem useTable=true, gera tabela markdown real. Se useNumberedList=true, gera lista numerada com passos concretos.
5. Tom: especialista falando com leigo informado. Direto, sem condescender.
6. Comprimento: aproxime do wordCountTarget (±15%). Não enche linguiça pra cumprir cota.
7. FAQ: responda cada pergunta de forma específica e curta (2-4 frases por resposta).
8. NUNCA use markdown além de # ## ### **bold** *italic* listas tabelas \`code\` > blockquote.
9. Linkagem interna: NÃO inclua links no texto (a UI fará isso depois). Foque em conteúdo bruto.

${EDITORIAL_RULES}

${SEO_GEO_RULES}
`;

export const writeArticlePrompt = {
  name: 'write-article',
  system: SYSTEM,
  user: (input: WriteArticleInput): string => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche} | Idioma: ${input.language}`);
    lines.push(`Título: # ${input.refinedTitle}`);
    lines.push(`Palavra-chave principal: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push(`Meta de palavras: ~${input.wordCountTarget}`);
    lines.push('');
    lines.push(`HOOK (1º parágrafo): ${input.hook}`);
    lines.push('');
    lines.push('OUTLINE A EXECUTAR:');
    input.sections.forEach((s, i) => {
      lines.push(`\n${i + 1}. ## ${s.h2}`);
      lines.push(`   answer-first: ${s.answerFirst}`);
      lines.push(`   incluir: ${s.mustInclude.join('; ')}`);
      if (s.h3s?.length) lines.push(`   subseções: ${s.h3s.join(' / ')}`);
      if (s.useTable) lines.push(`   ⚠ exige TABELA markdown real`);
      if (s.useNumberedList) lines.push(`   ⚠ exige LISTA NUMERADA com passos concretos`);
    });
    lines.push('');
    lines.push('FAQ (responda cada pergunta de forma específica):');
    input.faq.forEach((q) => {
      lines.push(`- Q: ${q.question}`);
      lines.push(`  hint: ${q.answerHint}`);
    });
    lines.push('');
    lines.push('Escreva o artigo completo em markdown.');
    lines.push(
      jsonOutputContract({
        content: '# Título\n\nMarkdown completo aqui, com hook, seções H2/H3, tabelas, listas e FAQ.',
        excerpt: 'Resumo do artigo, 140-200 chars, sem clichê',
      }),
    );
    return lines.join('\n');
  },
};
