import type {
  AIProvider,
  GenerateImageInput,
  GenerateImageResult,
  GenerateTextInput,
  GenerateTextResult,
} from '../types.js';

/**
 * MockProvider — gera respostas procedurais determinísticas pra todas as
 * skills do pipeline, sem chamar API externa. Detecta a skill pelo conteúdo
 * da mensagem do user (cada prompt tem marcadores únicos).
 *
 * Em desenvolvimento, é o suficiente pra rodar o pipeline ponta-a-ponta
 * sem custo de tokens.
 */
export class MockProvider implements AIProvider {
  readonly name = 'mock';
  readonly enabled = true;

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const userMsg = lastUserMsg(input);

    if (!input.jsonMode) {
      return { provider: this.name, model: 'mock-text', text: userMsg.slice(0, 200) };
    }

    const niche = matchAfter(userMsg, /Nicho:\s*(.+)/i) ?? 'geral';
    const channelName = matchAfter(userMsg, /Canal:\s*(.+)/i) ?? 'Blog';

    // ---- Skills do novo pipeline ----
    if (userMsg.includes('Gere de 8 a 10 candidatos')) {
      return jsonResult(this.name, 'mock-brainstorm', buildBrainstorm(niche));
    }
    if (userMsg.includes('Escolha 1 candidato e justifique')) {
      return jsonResult(this.name, 'mock-select', buildSelectTopic(userMsg));
    }
    if (userMsg.includes('Crie um outline detalhado')) {
      return jsonResult(this.name, 'mock-outline', buildOutline(niche));
    }
    if (userMsg.includes('Escreva o artigo completo em markdown')) {
      return jsonResult(this.name, 'mock-write', buildArticleContent(userMsg, niche));
    }
    if (userMsg.includes('Gere a metadata completa')) {
      return jsonResult(this.name, 'mock-metadata', buildMetadata(userMsg));
    }
    if (userMsg.includes('Crie o brief visual')) {
      return jsonResult(this.name, 'mock-image-brief', buildImageBrief(userMsg, niche));
    }

    // ---- Skills herdadas ----
    if (userMsg.includes('Categorias já existentes')) {
      const existing = parseExistingCategories(userMsg);
      return jsonResult(this.name, 'mock-category', buildCategory(niche, existing));
    }
    if (userMsg.includes('Tags existentes no canal') || /\nNicho:.*\nTítulo:/.test(userMsg)) {
      const title = matchAfter(userMsg, /Título:\s*(.+)/i) ?? '';
      return jsonResult(this.name, 'mock-tags', buildTags(niche, title));
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

function lastUserMsg(input: GenerateTextInput): string {
  const reversed = [...input.messages].reverse();
  return reversed.find((m) => m.role === 'user')?.content ?? '';
}

function jsonResult(provider: string, model: string, value: unknown): GenerateTextResult {
  return { provider, model, isJson: true, text: JSON.stringify(value) };
}

function matchAfter(s: string, re: RegExp): string | undefined {
  const m = s.match(re);
  return m?.[1]?.trim();
}

function parseExistingCategories(userMsg: string): { slug: string; name: string }[] {
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

// ---------- brainstorm ----------

const TOPICS_BY_NICHE: Record<string, string[]> = {
  cafe: [
    'Por que o tempo de extração do V60 muda tudo na xícara',
    'Cold brew vs café gelado: comparativo lado a lado',
    'Moagem ideal para AeroPress: 5 testes para calibrar em casa',
    'Erros comuns ao escolher grãos especiais que custam caro',
    'Como ler o rótulo de um café especial em 60 segundos',
    'Espresso em casa sem máquina: até onde vai o método Moka',
    'Água para café: TDS, dureza e o impacto real no sabor',
    'Cuppings caseiros: protocolo SCA simplificado para iniciantes',
    'Café orgânico vs comum: o que muda na xícara e no preço',
    'Tabela: 6 métodos de extração comparados por tempo, corpo e acidez',
  ],
  sono: [
    'Higiene do sono em 7 hábitos com base científica',
    'Luz azul à noite: qual a real influência no ritmo circadiano',
    'Travesseiro certo para dormir de lado, costas e barriga',
    'Por que acordamos cansados mesmo com 8 horas dormidas',
    'Sono polifásico explicado com dados, não anedotas',
  ],
  violao: [
    'Como afinar o violão de ouvido sem aplicativo',
    'Acordes essenciais que destravam 80% das músicas populares',
    'Cordas de nylon vs aço: comparativo para iniciantes',
    'Treino de mão direita: 3 exercícios para ganhar precisão',
    'Cifra ou tablatura: qual usar e quando',
  ],
};

const FALLBACK_TOPICS = [
  'Erros comuns que iniciantes cometem',
  'Comparativo dos 5 equipamentos mais úteis',
  'Como começar bem em até 30 minutos por dia',
  'Mitos do nicho: o que a evidência mostra',
  'Tabela: comparativo entre métodos do nicho',
];

const FORMATS = ['article', 'how-to', 'list', 'review', 'opinion'] as const;
const INTENTS = ['informational', 'comparison', 'how-to', 'opinion', 'troubleshooting', 'review'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function pick<T>(arr: readonly T[], i?: number): T {
  if (typeof i === 'number') return arr[i % arr.length] as T;
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function buildBrainstorm(niche: string) {
  const list = TOPICS_BY_NICHE[niche.toLowerCase()] ?? FALLBACK_TOPICS;
  const candidates = list.slice(0, 8).map((title, i) => {
    const intent = pick(INTENTS, i);
    const format = intent === 'comparison' || intent === 'review' ? 'review' : intent === 'how-to' ? 'how-to' : 'article';
    return {
      workingTitle: title,
      angle: `Aborda ${title.toLowerCase()} sob ângulo ${intent}, com dados verificáveis e exemplos concretos.`,
      intent,
      audienceLevel: pick(LEVELS, i),
      format,
      primaryKeyword: slugify(title).split('-').slice(0, 4).join(' '),
      secondaryKeywords: [niche, intent].filter((s) => s.length > 2),
      gapFilled: `Não há post recente cobrindo ${intent} para ${niche}.`,
      valueDelivered: `Leitor termina sabendo aplicar uma decisão concreta sobre ${title.toLowerCase()}.`,
    };
  });
  return { candidates };
}

function buildSelectTopic(userMsg: string) {
  // Extrai #1 (o primeiro candidato) — simples e estável pra dev.
  const titleMatch = /#1\.\s+(.+)/.exec(userMsg);
  const refined = titleMatch?.[1]?.trim() ?? 'Tema selecionado';
  return {
    selectedIndex: 1,
    reasoning:
      'Escolhi o primeiro candidato porque cobre uma intenção how-to/comparison sem repetição com slugs recentes e oferece valor aplicável imediato.',
    refinedTitle: refined.slice(0, 70),
  };
}

// ---------- outline ----------

function buildOutline(niche: string) {
  return {
    hook:
      `O detalhe que separa um resultado mediano de um excelente em ${niche} costuma ser ignorado por 90% dos iniciantes — e quase sempre é uma variável mensurável, não talento.`,
    sections: [
      {
        h2: 'Por que isso importa',
        answerFirst: `A escolha errada nessa etapa compromete tudo que vem depois.`,
        mustInclude: ['1 dado/estatística específica', 'exemplo concreto de erro comum', 'consequência mensurável'],
      },
      {
        h2: 'Como avaliar na prática',
        answerFirst: 'Avalie por 3 critérios objetivos antes de decidir.',
        mustInclude: ['lista numerada com 3-5 critérios', 'exemplo de cada critério em uso'],
        useNumberedList: true,
      },
      {
        h2: 'Comparativo lado a lado',
        answerFirst: 'A diferença real aparece em 4 dimensões mensuráveis.',
        mustInclude: ['tabela comparativa', 'pelo menos 2 opções comparadas', 'critérios objetivos'],
        useTable: true,
      },
      {
        h2: 'Erros mais comuns',
        answerFirst: 'Os 4 erros recorrentes que prejudicam o resultado.',
        mustInclude: ['cada erro com diagnóstico curto', 'correção concreta'],
      },
      {
        h2: 'Próximos passos',
        answerFirst: 'O que fazer hoje pra aplicar tudo isso.',
        mustInclude: ['ação específica de curto prazo', 'sinal de progresso pra acompanhar'],
      },
    ],
    faq: [
      { question: 'Preciso de equipamento caro pra começar?', answerHint: 'Foco em essencial vs supérfluo' },
      { question: 'Qual o erro mais comum?', answerHint: 'Diagnóstico + correção' },
      { question: 'Quanto tempo até ver resultado?', answerHint: 'Janela realista 2-4 semanas' },
    ],
    wordCountTarget: 1100,
  };
}

// ---------- write article ----------

function buildArticleContent(userMsg: string, niche: string) {
  const titleMatch = /Título:\s*#\s*(.+)/.exec(userMsg) ?? /HOOK.*?:.*\n##\s*(.+)/.exec(userMsg);
  const title = titleMatch?.[1]?.trim() ?? `Guia de ${niche}`;

  const content = `# ${title}

> Conteúdo gerado pelo provider mock. Em produção (provider claude/openai), o pipeline gera markdown editorial real seguindo o outline.

A diferença entre um resultado bom e medíocre em ${niche} costuma ser uma variável mensurável que iniciantes ignoram. Este guia organiza o que importa.

## Por que isso importa

A escolha errada na primeira etapa compromete tudo que vem depois. Um exemplo concreto: se você não calibra X corretamente, perde 30% do potencial — independente do equipamento. Não é mística, é parametrização.

## Como avaliar na prática

Avalie por 3 critérios objetivos:

1. **Consistência**: você consegue repetir o resultado em 5 tentativas seguidas?
2. **Sensibilidade**: pequenas mudanças geram diferença perceptível?
3. **Escalabilidade**: o que funciona pra você funciona em volumes diferentes?

Cada critério tem um sinal claro. Se a resposta for "depende", você ainda não chegou lá.

## Comparativo lado a lado

| Opção | Custo | Curva de aprendizado | Resultado em 30 dias |
| ----- | ----- | ------------------- | -------------------- |
| Iniciante | Baixo | 1 semana | 60-70% do potencial |
| Intermediário | Médio | 2-3 semanas | 80-85% |
| Avançado | Alto | 1-2 meses | 90-95% |

A escolha depende menos de orçamento e mais de quanto tempo você consegue dedicar.

## Erros mais comuns

- **Pular fundamentos**: querer técnica avançada sem dominar básico. Sintoma: variabilidade alta entre tentativas.
- **Equipamento como muleta**: comprar mais antes de saber usar o que tem.
- **Ignorar feedback**: não anotar o que funcionou e por quê.
- **Comparar com expert no Instagram**: você está vendo o highlight reel, não o processo.

## Próximos passos

Hoje, faça uma coisa: estabeleça baseline. Repita seu processo atual 5 vezes seguidas e anote o resultado. Em uma semana, você sabe onde está variando — aí muda UMA variável por vez.

## Perguntas frequentes

### Preciso de equipamento caro pra começar?

Não. O essencial cabe em orçamento baixo e dá pra ver resultado em 2-3 semanas. Equipamento avançado faz sentido depois que você sabe o que está fazendo — antes é desperdício.

### Qual o erro mais comum?

Pular fundamentos. Quase sempre. O sintoma é variabilidade alta entre tentativas — você acerta um dia e erra no outro sem saber por quê.

### Quanto tempo até ver resultado?

Com 20-30 minutos diários focados em UMA variável por vez, melhoria perceptível em 2-4 semanas. Se está há 3 meses sem mudança, provavelmente está mudando muita coisa ao mesmo tempo.
`;

  return {
    content,
    excerpt: `Como diferenciar resultado bom de medíocre em ${niche} aplicando 3 critérios objetivos, evitando os 4 erros mais comuns.`,
  };
}

// ---------- metadata ----------

function buildMetadata(userMsg: string) {
  const titleMatch = /Título atual:\s*(.+)/i.exec(userMsg);
  const title = titleMatch?.[1]?.trim() ?? 'Guia';
  const kwMatch = /Palavra-chave principal:\s*(.+)/i.exec(userMsg);
  const primary = kwMatch?.[1]?.trim() ?? 'guia';
  const niche = matchAfter(userMsg, /Nicho:\s*(.+)/i) ?? 'geral';

  const slug = slugify(title);
  const metaTitle = title.slice(0, 60);
  const metaDescription = `${title}. Guia editorial com critérios, comparativo e erros comuns para decidir com base em dados, não em achismo.`.slice(
    0,
    160,
  );

  return {
    metaTitle,
    metaDescription,
    slug,
    keywords: Array.from(
      new Set([primary, niche, ...title.toLowerCase().split(/\s+/).filter((w) => w.length > 4)]),
    ).slice(0, 8),
    suggestedTags: Array.from(
      new Set([slugify(primary), slugify(niche), 'guia', 'iniciante']),
    )
      .filter((t) => t.length > 1)
      .slice(0, 5),
    summary: `${title} — visão prática com critérios objetivos para aplicar imediatamente.`,
  };
}

// ---------- image brief ----------

function buildImageBrief(userMsg: string, niche: string) {
  const titleMatch = /Título do post:\s*(.+)/i.exec(userMsg);
  const title = titleMatch?.[1]?.trim() ?? niche;
  return {
    prompt: `Editorial photograph: hands using ${title} tool/element in natural daylight, on a wood surface, shallow depth of field, soft warm tones, 16:9, shot on 50mm lens, no text, no watermark.`,
    negativePrompt: 'text, watermark, logo, low quality, cartoon, illustration, 3d render, oversaturated',
    alt: `Foto editorial em luz natural mostrando o uso de ${title.toLowerCase()} em superfície de madeira clara.`,
    mood: 'calm, tactile, editorial',
  };
}

// ---------- legacy skills (mantidas) ----------

function buildCategory(niche: string, existing: { slug: string; name: string }[]) {
  if (existing.length > 0 && Math.random() < 0.7) {
    const reused = existing[Math.floor(Math.random() * existing.length)]!;
    return {
      slug: reused.slug,
      name: reused.name,
      description: `Conteúdo da categoria ${reused.name}.`,
      reusedExisting: true,
    };
  }
  const candidates =
    niche.toLowerCase() === 'cafe'
      ? [
          { slug: 'metodos', name: 'Métodos' },
          { slug: 'graos', name: 'Grãos' },
          { slug: 'equipamentos', name: 'Equipamentos' },
          { slug: 'receitas', name: 'Receitas' },
          { slug: 'cultura', name: 'Cultura' },
        ]
      : [
          { slug: 'fundamentos', name: 'Fundamentos' },
          { slug: 'tecnicas', name: 'Técnicas' },
          { slug: 'guias', name: 'Guias' },
          { slug: 'opinioes', name: 'Opiniões' },
        ];
  const free = candidates.filter((c) => !existing.some((e) => e.slug === c.slug));
  const pickCand = (free.length > 0 ? free : candidates)[
    Math.floor(Math.random() * (free.length || candidates.length))
  ]!;
  return {
    slug: pickCand.slug,
    name: pickCand.name,
    description: `Conteúdo da categoria ${pickCand.name} no nicho ${niche}.`,
    reusedExisting: false,
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
  const fromNiche = niche.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 1);
  return { tags: Array.from(new Set([...fromNiche, ...fromTitle])).slice(0, 5) };
}

function buildAnalysisInsights(channelName: string, niche: string) {
  const isCoffee = niche.toLowerCase().includes('cafe');
  const isViolao = niche.toLowerCase().includes('viol');
  const isSono = niche.toLowerCase().includes('sono');

  const base = [
    {
      severity: 'high',
      area: 'authority',
      title: 'Bloco de autor sem credenciais visíveis',
      detail: `O autor de cada post não declara expertise verificável. E-E-A-T do Google e citação por LLMs valorizam isso fortemente.`,
    },
    {
      severity: 'medium',
      area: 'content',
      title: `Profundidade média no nicho ${niche}`,
      detail: `Posts cobrem o básico mas não trazem dados originais. Conteúdo experiencial é a melhor defesa contra IA generalista citar concorrentes.`,
    },
    {
      severity: 'medium',
      area: 'structure',
      title: 'Sem hub pages / cluster de conteúdo',
      detail: `Cada post vive isolado. Crie 2-3 páginas-pilar que linkam pra os posts e recebem links dos posts.`,
    },
    {
      severity: 'low',
      area: 'opportunity',
      title: 'Oportunidade: comparativos lado a lado',
      detail: `Conteúdo "X vs Y" tem alta intenção de compra e baixa concorrência genérica.`,
    },
  ];

  if (isCoffee) {
    base.push({
      severity: 'medium',
      area: 'content',
      title: 'Tabelas de parâmetros são uma assinatura editorial forte',
      detail: 'Padronizar uma tabela em todos os posts cria identidade e é altamente citável por LLMs.',
    });
  }
  if (isViolao) {
    base.push({
      severity: 'medium',
      area: 'opportunity',
      title: 'Faltam tablaturas/cifras embedadas',
      detail: 'Posts sem material prático competem em desvantagem.',
    });
  }
  if (isSono) {
    base.push({
      severity: 'high',
      area: 'authority',
      title: 'Conteúdo de saúde precisa de revisão profissional',
      detail: 'No nicho sono/saúde, posts sem revisor médico declarado têm menor chance de citação por LLMs.',
    });
  }

  base.push({
    severity: 'low',
    area: 'structure',
    title: 'Aproveitar mais o llms.txt',
    detail: `Considere adicionar uma seção "Posts essenciais" curada para os 5-7 conteúdos mais densos do ${channelName}.`,
  });

  return { insights: base.slice(0, 6) };
}
