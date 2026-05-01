/**
 * Mapper centralizado de prompts.
 *
 * REGRAS:
 * 1. Tudo que é prompt vive aqui. Nenhuma task ou provider pode declarar
 *    prompts inline — sempre referenciar uma entrada deste objeto.
 * 2. Cada entrada exporta `system` (string) e `user` (função recebendo input
 *    tipado e devolvendo string). Isso facilita evoluir prompts isoladamente.
 * 3. Em produção, prompts podem migrar para um banco/painel sem alterar o
 *    contrato — o resto do código só conhece este módulo.
 *
 * Os prompts atuais são intencionalmente simples — a próxima fase do projeto
 * é justamente refiná-los caso a caso.
 */

export interface ArticlePromptInput {
  channelName: string;
  niche: string;
  language: string;
  /** Lista de slugs de posts já publicados, pra evitar repetição. */
  existingSlugs?: string[];
}

export interface CategoryPromptInput {
  title: string;
  excerpt: string;
  niche: string;
  /** Categorias já existentes no canal — preferir reutilizar. */
  existing: { slug: string; name: string }[];
}

export interface TagsPromptInput {
  title: string;
  excerpt: string;
  niche: string;
  contentExcerpt?: string;
}

export interface ImagePromptInput {
  title: string;
  niche: string;
}

export interface SiteAnalysisPromptInput {
  channelName: string;
  niche: string;
  siteUrl: string;
  /** Trecho do HTML da home (head + primeiros parágrafos). */
  htmlSample: string;
  /** Resumo dos sinais técnicos já coletados pelo audit. */
  technicalSummary: {
    performance: { score: number; loadTimeMs: number; htmlSizeKb: number };
    seo: { score: number; hasTitle: boolean; titleLength: number; hasMetaDescription: boolean; hasCanonical: boolean; hasOpenGraph: boolean; hasH1: boolean };
    geo: { score: number; jsonLdCount: number; hasLlmsTxt: boolean; hasRssFeed: boolean; botsAllowed: boolean };
    discovery: { hasRobotsTxt: boolean; hasSitemap: boolean };
  };
}

export const prompts = {
  article: {
    name: 'article',
    system: [
      'Você é um editor sênior responsável por blogs de nicho em português do Brasil.',
      'Sua escrita é clara, direta e baseada em fatos verificáveis. Evita clichês de marketing.',
      'Sempre estrutura o artigo com headings semânticos (##, ###), parágrafos curtos e listas quando faz sentido.',
      'Quando faltar informação concreta, prefere frases honestas a inventar dados.',
    ].join('\n'),
    user: (input: ArticlePromptInput): string => {
      const lines: string[] = [];
      lines.push(`Canal: ${input.channelName}`);
      lines.push(`Nicho: ${input.niche}`);
      lines.push(`Idioma: ${input.language}`);
      if (input.existingSlugs?.length) {
        lines.push('');
        lines.push('Slugs já publicados (evite repetir tema/ângulo):');
        lines.push(input.existingSlugs.slice(0, 30).map((s) => `- ${s}`).join('\n'));
      }
      lines.push('');
      lines.push('Tarefa: escolha um tema relevante para o nicho e produza um artigo completo.');
      lines.push('');
      lines.push('Responda em JSON válido com exatamente este formato:');
      lines.push(
        JSON.stringify(
          {
            title: 'Título atrativo, 60-90 chars',
            slug: 'kebab-case-derivado-do-titulo',
            excerpt: 'Resumo de 140-200 caracteres',
            content: '# Título\n\nMarkdown completo com ## e ### organizando o texto.',
            metaTitle: 'Título otimizado para SEO até 60 chars',
            metaDescription: 'Meta description 140-160 chars',
            keywords: ['palavra-chave-1', 'palavra-chave-2'],
            format: 'article | how-to | list | review | opinion',
            faq: [{ question: 'string', answer: 'string' }],
          },
          null,
          2,
        ),
      );
      return lines.join('\n');
    },
  },

  category: {
    name: 'category',
    system: [
      'Você organiza conteúdo editorial em categorias amplas (4-8 por canal no total).',
      'Prefira reutilizar categoria existente se for compatível.',
      'Use kebab-case no slug e nome curto e claro (1-3 palavras).',
    ].join('\n'),
    user: (input: CategoryPromptInput): string => {
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
      lines.push('Responda em JSON estrito com este formato:');
      lines.push(
        JSON.stringify(
          { slug: 'kebab-case', name: 'Nome curto', description: 'Descrição 100-200 chars' },
          null,
          2,
        ),
      );
      return lines.join('\n');
    },
  },

  tags: {
    name: 'tags',
    system: [
      'Você extrai 3-6 tags úteis para SEO e descoberta interna do conteúdo.',
      'Use kebab-case, evite plurais óbvios e evite repetir o título inteiro.',
    ].join('\n'),
    user: (input: TagsPromptInput): string => {
      const lines: string[] = [];
      lines.push(`Nicho: ${input.niche}`);
      lines.push(`Título: ${input.title}`);
      lines.push(`Resumo: ${input.excerpt}`);
      if (input.contentExcerpt) {
        lines.push('');
        lines.push('Trecho do conteúdo (primeiras frases):');
        lines.push(input.contentExcerpt);
      }
      lines.push('');
      lines.push('Responda em JSON estrito: { "tags": ["slug-1", "slug-2", ...] }');
      return lines.join('\n');
    },
  },

  analyze: {
    name: 'analyze',
    system: [
      'Você é um analista editorial e SEO/GEO sênior.',
      'Avalia sites de nicho e dá recomendações curtas, específicas e acionáveis.',
      'Foca no que NÃO aparece em métricas técnicas: profundidade de conteúdo, autoridade percebida, lacunas de cobertura, hierarquia editorial, oportunidades estratégicas.',
      'Não repete o que o audit técnico já mostrou (presença de title, sitemap, etc.).',
    ].join('\n'),
    user: (input: SiteAnalysisPromptInput): string => {
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
      lines.push('Trecho do HTML da home (cabeçalho + corpo):');
      lines.push('```html');
      lines.push(input.htmlSample.slice(0, 6000));
      lines.push('```');
      lines.push('');
      lines.push('Tarefa: gere de 4 a 8 insights estratégicos. Cada um deve ser específico ao que você viu, não genérico.');
      lines.push('Áreas válidas: "content" (qualidade/profundidade), "structure" (hierarquia/UX editorial), "authority" (E-E-A-T, fontes, perfil de autor), "opportunity" (gaps no nicho, conteúdo faltante).');
      lines.push('Severidade: "high" pra problemas que travam crescimento, "medium" pra melhorias claras, "low" pra refinamentos.');
      lines.push('');
      lines.push('Responda em JSON estrito com este formato:');
      lines.push(JSON.stringify({
        insights: [
          { severity: 'high|medium|low', area: 'content|structure|authority|opportunity', title: 'string curta', detail: 'string explicando o que e por que (1-3 frases)' },
        ],
      }, null, 2));
      return lines.join('\n');
    },
  },

  image: {
    name: 'image',
    system: 'Você descreve imagens fotográficas editoriais para acompanhar artigos.',
    user: (input: ImagePromptInput): string => {
      return [
        `Crie uma descrição visual rica para a imagem de capa de um post sobre "${input.title}".`,
        `Nicho: ${input.niche}.`,
        'Estilo: foto editorial, luz natural, profundidade de campo, sem texto sobreposto, 16:9.',
        'Responda em JSON estrito: { "prompt": "...", "alt": "..." }',
      ].join('\n');
    },
  },
} as const;

export type PromptName = keyof typeof prompts;
