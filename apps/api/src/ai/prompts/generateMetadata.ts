import { SEO_GEO_RULES, jsonOutputContract } from './_shared.js';

export interface GenerateMetadataInput {
  title: string;
  content: string;
  excerpt: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  niche: string;
  channelName: string;
  language: string;
}

const SYSTEM = `
Você é especialista em metadata pra SEO/GEO. Recebe um artigo finalizado e gera os campos que entram no <head> e nos schemas estruturados.

PRIORIDADES:
- metaTitle: 50-60 chars, palavra-chave principal nos primeiros 30 chars, sem clickbait grosso, mas com gancho.
- metaDescription: 140-160 chars, com BENEFÍCIO concreto pro leitor (não "saiba mais"). Termina com call-to-action sutil quando faz sentido.
- slug: kebab-case, 3-7 palavras, sem stopwords ("o", "a", "de", "para") quando der pra remover sem perder sentido.
- keywords: 5-8 termos. Inclui a primary, as secondary e variações long-tail. Sem repetição.
- suggestedTags: 3-6 tags em kebab-case. Mais específicas que as keywords.
- summary: 2-3 frases pra preview de cards/redes sociais.

${SEO_GEO_RULES}

NUNCA use clickbait do tipo "VOCÊ NÃO VAI ACREDITAR" ou "O SEGREDO QUE NINGUÉM TE CONTOU". Confiabilidade > CTR de curto prazo.
`;

export const generateMetadataPrompt = {
  name: 'generate-metadata',
  system: SYSTEM,
  user: (input: GenerateMetadataInput): string => {
    const lines: string[] = [];
    lines.push(`Canal: ${input.channelName} | Nicho: ${input.niche} | Idioma: ${input.language}`);
    lines.push(`Título atual: ${input.title}`);
    lines.push(`Palavra-chave principal: ${input.primaryKeyword}`);
    if (input.secondaryKeywords?.length) lines.push(`Secundárias: ${input.secondaryKeywords.join(', ')}`);
    lines.push('');
    lines.push('Resumo já existente:');
    lines.push(input.excerpt);
    lines.push('');
    lines.push('Trecho do conteúdo (primeiras seções pra contexto):');
    lines.push(input.content.slice(0, 2500));
    lines.push('');
    lines.push('Gere a metadata completa.');
    lines.push(
      jsonOutputContract({
        metaTitle: '50-60 chars, palavra-chave principal nos primeiros 30',
        metaDescription: '140-160 chars com benefício concreto',
        slug: 'kebab-case-curto',
        keywords: ['kw1', 'kw2', 'kw3', 'kw4', 'kw5'],
        suggestedTags: ['tag-1', 'tag-2', 'tag-3'],
        summary: 'Preview 2-3 frases para cards/redes',
      }),
    );
    return lines.join('\n');
  },
};
