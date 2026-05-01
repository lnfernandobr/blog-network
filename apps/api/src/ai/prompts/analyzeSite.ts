import { jsonOutputContract } from './_shared.js';

export interface AnalyzeSitePromptInput {
  channelName: string;
  niche: string;
  siteUrl: string;
  /** Trecho do HTML da home (head + primeiros parágrafos). */
  htmlSample: string;
  /** Resumo dos sinais técnicos já coletados pelo audit. */
  technicalSummary: {
    performance: { score: number; loadTimeMs: number; htmlSizeKb: number };
    seo: {
      score: number;
      hasTitle: boolean;
      titleLength: number;
      hasMetaDescription: boolean;
      hasCanonical: boolean;
      hasOpenGraph: boolean;
      hasH1: boolean;
    };
    geo: {
      score: number;
      jsonLdCount: number;
      hasLlmsTxt: boolean;
      hasRssFeed: boolean;
      botsAllowed: boolean;
    };
    discovery: { hasRobotsTxt: boolean; hasSitemap: boolean };
  };
}

const SYSTEM = `
Você é analista editorial e SEO/GEO sênior. Avalia sites de nicho e dá recomendações específicas e acionáveis.

FOQUE NO QUE NÃO APARECE EM MÉTRICAS TÉCNICAS:
- profundidade e originalidade do conteúdo
- autoridade percebida (E-E-A-T)
- lacunas de cobertura no nicho
- hierarquia editorial e UX de leitura
- oportunidades estratégicas

REGRAS:
- NÃO repita o que o audit técnico já mostrou (presença de title, sitemap, etc.)
- Cada insight é específico ao que você viu no HTML, não genérico
- Severidade: high (trava crescimento), medium (melhoria clara), low (refinamento)
`;

export const analyzeSitePrompt = {
  name: 'analyze-site',
  system: SYSTEM,
  user: (input: AnalyzeSitePromptInput): string => {
    const t = input.technicalSummary;
    const lines: string[] = [];
    lines.push(`Site: ${input.siteUrl}`);
    lines.push(`Canal: ${input.channelName}`);
    lines.push(`Nicho: ${input.niche}`);
    lines.push('');
    lines.push('Resumo do audit técnico (já coletado, não repita):');
    lines.push(`- Performance: ${t.performance.score}/100 (${t.performance.loadTimeMs}ms, ${t.performance.htmlSizeKb}KB)`);
    lines.push(`- SEO: ${t.seo.score}/100 (title ${t.seo.titleLength} chars, meta:${t.seo.hasMetaDescription}, canonical:${t.seo.hasCanonical}, og:${t.seo.hasOpenGraph}, h1:${t.seo.hasH1})`);
    lines.push(`- GEO: ${t.geo.score}/100 (jsonLd:${t.geo.jsonLdCount}, llms.txt:${t.geo.hasLlmsTxt}, rss:${t.geo.hasRssFeed}, bots-ai:${t.geo.botsAllowed})`);
    lines.push(`- Discovery: robots:${t.discovery.hasRobotsTxt}, sitemap:${t.discovery.hasSitemap}`);
    lines.push('');
    lines.push('Trecho do HTML da home:');
    lines.push('```html');
    lines.push(input.htmlSample.slice(0, 6000));
    lines.push('```');
    lines.push('');
    lines.push('Gere de 4 a 8 insights estratégicos.');
    lines.push('Áreas válidas: content | structure | authority | opportunity');
    lines.push(
      jsonOutputContract({
        insights: [
          {
            severity: 'high|medium|low',
            area: 'content|structure|authority|opportunity',
            title: 'string curta',
            detail: 'explicação 1-3 frases específica ao que você viu',
          },
        ],
      }),
    );
    return lines.join('\n');
  },
};
