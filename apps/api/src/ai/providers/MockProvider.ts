import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';

/**
 * MockProvider gera conteúdo procedural útil para desenvolvimento.
 *
 * Não chama nenhuma API externa. As saídas são determinísticas o suficiente
 * pra permitir testes manuais do fluxo (scheduler → pipeline → publicação),
 * mas variadas o suficiente pra preencher o blog com posts diferentes.
 *
 * Quando `jsonMode = true`, ele tenta detectar a task pelo conteúdo da
 * primeira mensagem `user` e devolve um JSON aderente ao contrato esperado
 * pelas tasks (apps/api/src/ai/tasks/*).
 */
export class MockProvider implements AIProvider {
  readonly name = 'mock';
  readonly enabled = true;

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const userMsg = input.messages.findLast?.((m) => m.role === 'user')?.content
      ?? input.messages.find((m) => m.role === 'user')?.content
      ?? '';

    if (!input.jsonMode) {
      // fallback genérico: nunca usado pelas tasks atuais.
      return { provider: this.name, model: 'mock-text', text: userMsg.slice(0, 200) };
    }

    const niche = matchAfter(userMsg, /Nicho:\s*(.+)/i) ?? 'geral';
    const channelName = matchAfter(userMsg, /Canal:\s*(.+)/i) ?? 'Blog';
    const language = matchAfter(userMsg, /Idioma:\s*(.+)/i) ?? 'pt-BR';

    if (userMsg.includes('produza um artigo completo')) {
      return jsonResult(this.name, 'mock-article', buildArticle({ channelName, niche, language }));
    }
    if (userMsg.includes('Categorias já existentes')) {
      const existing = parseExisting(userMsg);
      return jsonResult(this.name, 'mock-category', buildCategory(niche, existing));
    }
    if (userMsg.startsWith('Nicho:') && userMsg.includes('Título:')) {
      const title = matchAfter(userMsg, /Título:\s*(.+)/i) ?? '';
      return jsonResult(this.name, 'mock-tags', buildTags(niche, title));
    }
    if (userMsg.includes('descrição visual rica')) {
      const title = matchBetween(userMsg, /sobre\s+"([^"]+)"/) ?? 'tema';
      return jsonResult(this.name, 'mock-image-prompt', {
        prompt: `Foto editorial em 16:9 representando "${title}" no contexto de ${niche}.`,
        alt: `Imagem ilustrativa sobre ${title.toLowerCase()}.`,
      });
    }
    if (userMsg.includes('insights estratégicos')) {
      return jsonResult(this.name, 'mock-analyze', buildAnalysisInsights(channelName, niche));
    }

    return jsonResult(this.name, 'mock-fallback', { text: userMsg.slice(0, 200) });
  }

  async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    const aspect = input.aspect ?? 'wide';
    const dims = aspect === 'square' ? [1200, 1200] : aspect === 'portrait' ? [900, 1600] : [1600, 900];
    const seed = encodeURIComponent(input.seed ?? input.prompt.slice(0, 40));
    return {
      provider: this.name,
      url: `https://picsum.photos/seed/${seed}/${dims[0]}/${dims[1]}`,
      alt: input.prompt.slice(0, 140),
      width: dims[0]!,
      height: dims[1]!,
    };
  }
}

// ---------- helpers ----------

function jsonResult(provider: string, model: string, value: unknown): GenerateTextResult {
  return { provider, model, isJson: true, text: JSON.stringify(value) };
}

function matchAfter(s: string, re: RegExp): string | undefined {
  const m = s.match(re);
  return m?.[1]?.trim();
}

function matchBetween(s: string, re: RegExp): string | undefined {
  const m = s.match(re);
  return m?.[1]?.trim();
}

function parseExisting(userMsg: string): { slug: string; name: string }[] {
  const lines = userMsg.split('\n');
  const out: { slug: string; name: string }[] = [];
  for (const l of lines) {
    const m = /^-\s+([a-z0-9-]+)\s+—\s+(.+)$/i.exec(l);
    if (m) out.push({ slug: m[1]!, name: m[2]!.trim() });
  }
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const TOPICS_BY_NICHE: Record<string, string[]> = {
  cafe: [
    'Como escolher grãos especiais para o método V60',
    'O ritual do café coado pela manhã',
    'Diferença entre arábica e robusta na xícara',
    'Moagem ideal para cada método de extração',
    'Cold brew vs café gelado: quando usar cada um',
    'A importância da água para o sabor da xícara',
    'AeroPress invertida: o método de viagem',
  ],
  sono: [
    'Higiene do sono: 7 hábitos para dormir melhor',
    'Como a luz azul afeta o ritmo circadiano',
    'Travesseiro certo para cada posição de dormir',
    'Por que acordamos cansados mesmo dormindo 8 horas',
    'Sono polifásico: o que a ciência diz',
  ],
  violao: [
    'Como afinar o violão de ouvido em 3 minutos',
    'Acordes essenciais para iniciantes em uma semana',
    'Diferença entre nylon e aço: qual escolher',
    'Treino de dedos para destravar a mão direita',
  ],
};

const FALLBACK_TOPICS = [
  'Guia inicial completo para começar no nicho',
  'Erros comuns que iniciantes cometem',
  'Equipamentos essenciais sem gastar muito',
  'Rotina semanal que faz diferença real',
  'Mitos e verdades discutidos com calma',
];

function pickTopic(niche: string): string {
  const list = TOPICS_BY_NICHE[niche.toLowerCase()] ?? FALLBACK_TOPICS;
  const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
  return `${list[Math.floor(Math.random() * list.length)]} (${stamp})`;
}

function buildArticle(opts: { channelName: string; niche: string; language: string }) {
  const title = pickTopic(opts.niche);
  const slug = slugify(title);
  const excerpt = `Um guia editorial direto sobre ${title.toLowerCase()}, com parâmetros, erros comuns e referências práticas para o leitor de ${opts.channelName}.`;
  const content = articleMarkdown(title, opts.niche);
  const keywords = title
    .toLowerCase()
    .split(/[^a-záéíóúãõçñ]+/)
    .filter((w) => w.length > 4)
    .slice(0, 6);
  return {
    title,
    slug,
    excerpt,
    content,
    metaTitle: `${title}`.slice(0, 70),
    metaDescription: excerpt.slice(0, 175),
    keywords,
    format: 'article' as const,
    faq: [
      {
        question: 'Por onde começar?',
        answer: 'Pelo essencial — o que cabe no orçamento e a prática consistente. Equipamento avançado pode esperar.',
      },
      {
        question: 'Quanto tempo até ver resultado?',
        answer: 'Com 15-30 minutos diários, melhorias notáveis aparecem em 2 a 4 semanas.',
      },
    ],
  };
}

function articleMarkdown(title: string, niche: string): string {
  return `# ${title}

> Conteúdo gerado automaticamente pelo pipeline de IA (provider mock). Em produção, este texto vem de Claude/OpenAI.

## Introdução

O nicho de **${niche}** evoluiu nos últimos anos e agora há recursos sólidos para quem quer começar com o pé direito. Este artigo organiza o essencial.

## Por que isso importa

- Pequenos ajustes acumulam grande impacto.
- Consistência supera intensidade.
- Erros comuns são facilmente evitáveis com preparo mínimo.

## Passos práticos

1. Comece pelo essencial e ignore acessórios desnecessários.
2. Estude os fundamentos antes de gastar com equipamento caro.
3. Acompanhe sua evolução com algum tipo de registro simples.
4. Reveja a rotina a cada duas semanas e ajuste conforme o feedback.

### Ponto de atenção

Não confunda hábito com perfeccionismo. O objetivo é uma prática sustentável, não a perfeição imediata.

## Tabela rápida de referência

| Estágio       | Foco principal           | Tempo médio |
| ------------- | ------------------------ | ----------- |
| Iniciante     | Fundamentos              | 2 semanas   |
| Intermediário | Refinamento              | 1-2 meses   |
| Avançado      | Personalização e estilo  | 3+ meses    |

## Conclusão

Comece simples, mantenha a consistência e revise a rotina periodicamente. O melhor momento para começar foi ontem; o segundo melhor é agora.
`;
}

function buildCategory(niche: string, existing: { slug: string; name: string }[]) {
  if (existing.length > 0 && Math.random() < 0.7) {
    const reused = existing[Math.floor(Math.random() * existing.length)]!;
    return { slug: reused.slug, name: reused.name, description: `Conteúdo da categoria ${reused.name}.` };
  }
  const candidates = niche.toLowerCase() === 'cafe'
    ? [{ slug: 'metodos', name: 'Métodos' }, { slug: 'graos', name: 'Grãos' }, { slug: 'equipamentos', name: 'Equipamentos' }, { slug: 'receitas', name: 'Receitas' }, { slug: 'cultura', name: 'Cultura' }]
    : [{ slug: 'fundamentos', name: 'Fundamentos' }, { slug: 'tecnicas', name: 'Técnicas' }, { slug: 'guias', name: 'Guias' }, { slug: 'opinioes', name: 'Opiniões' }];
  const free = candidates.filter((c) => !existing.some((e) => e.slug === c.slug));
  const pick = (free.length > 0 ? free : candidates)[Math.floor(Math.random() * (free.length || candidates.length))]!;
  return {
    slug: pick.slug,
    name: pick.name,
    description: `Conteúdo da categoria ${pick.name} no nicho ${niche}.`,
  };
}

function buildTags(niche: string, title: string) {
  const fromTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  const fromNiche = niche
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 1);
  return { tags: Array.from(new Set([...fromNiche, ...fromTitle])).slice(0, 5) };
}

function buildAnalysisInsights(channelName: string, niche: string) {
  // Insights "razoáveis" pré-fabricados pra simular o que um LLM real entregaria.
  // Variam levemente por nicho pra dar sensação de análise contextual.
  const isCoffee = niche.toLowerCase().includes('cafe');
  const isViolao = niche.toLowerCase().includes('viol');
  const isSono = niche.toLowerCase().includes('sono');

  const base = [
    {
      severity: 'high',
      area: 'authority',
      title: 'Bloco de autor sem credenciais visíveis',
      detail: `O autor de cada post não declara expertise verificável (formação, anos de experiência, certificações). E-E-A-T do Google e citação por LLMs valorizam isso fortemente. Adicione um parágrafo com credenciais relevantes.`,
    },
    {
      severity: 'medium',
      area: 'content',
      title: `Profundidade média no nicho ${niche}`,
      detail: `Posts cobrem o básico mas não trazem dados originais (testes próprios, comparativos numéricos, fotos de bastidores). Conteúdo experiencial é a melhor defesa contra IA generalista citar concorrentes em vez de você.`,
    },
    {
      severity: 'medium',
      area: 'structure',
      title: 'Sem hub pages / cluster de conteúdo',
      detail: `Cada post vive isolado. Crie 2-3 páginas-pilar (ex: "Guia completo de ${niche}") que linkam para os posts e recebem links dos posts. Isso concentra autoridade e ajuda LLMs a entender a estrutura do site.`,
    },
    {
      severity: 'low',
      area: 'opportunity',
      title: 'Oportunidade: comparativos lado a lado',
      detail: `Conteúdo do tipo "X vs Y" tem alta intenção de compra e baixa concorrência genérica. Considere 2-3 comparativos no nicho.`,
    },
  ];

  if (isCoffee) {
    base.push({
      severity: 'medium',
      area: 'content',
      title: 'Tabelas de parâmetros são uma assinatura editorial forte',
      detail: 'Cada método (V60, AeroPress, espresso) tem parâmetros concretos (proporção, moagem, temperatura). Padronizar uma tabela em todos os posts cria identidade e é altamente citável por LLMs.',
    });
  }
  if (isViolao) {
    base.push({
      severity: 'medium',
      area: 'opportunity',
      title: 'Faltam tablaturas/cifras embedadas',
      detail: 'Posts de violão sem material prático (cifras, áudios, vídeos curtos) competem em desvantagem. Considere embeds de Spotify/YouTube com timestamps e cifras formatadas.',
    });
  }
  if (isSono) {
    base.push({
      severity: 'high',
      area: 'authority',
      title: 'Conteúdo de saúde precisa de revisão profissional declarada',
      detail: 'No nicho sono/saúde, posts sem revisor médico identificado têm menor chance de citação por LLMs (que são conservadores em saúde) e de ranquear pra YMYL.',
    });
  }

  base.push({
    severity: 'low',
    area: 'structure',
    title: 'Aproveitar mais o llms.txt',
    detail: `O llms.txt presente está bem montado. Considere adicionar uma seção "Posts essenciais" curada para os 5-7 conteúdos mais densos do ${channelName} — é onde o LLM vai pescar primeiro.`,
  });

  return { insights: base.slice(0, 6) };
}
