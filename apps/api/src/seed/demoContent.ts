/**
 * Seed determinístico para ambiente local.
 *
 * - Sempre garante o canal de demonstração `cafe`.
 * - Em desenvolvimento, sempre presença de 2 posts fixos (mesmos slugs, mesmo
 *   conteúdo, mesmas categorias) — eles SIMULAM conteúdo gerado por IA, mas
 *   não chamam a pipeline. Isso evita que `pnpm dev` gaste tokens, regenere
 *   conteúdo a cada restart e produza artefatos novos toda vez.
 * - Em produção, nada é seedado além do canal vazio: a pipeline real popula.
 *
 * Os 2 posts são "upserted" por slug, então editar este arquivo e reiniciar
 * sobrescreve o conteúdo dos posts demo no banco.
 */

import { Channel, type ChannelDoc } from '../models/Channel.js';
import { Author, type AuthorDoc } from '../models/Author.js';
import { Category, type CategoryDoc } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Post } from '../models/Post.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { countWords, readingTimeMinutes } from '../utils/readingTime.js';

const CHANNEL_SLUG = 'cafe';

interface FixedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  categorySlug: string;
  categoryName: string;
  faq: { question: string; answer: string }[];
  format: 'article' | 'how-to' | 'list' | 'review' | 'opinion';
  featured: boolean;
  publishedAtDaysAgo: number;
}

const FIXED_CATEGORIES = [
  { slug: 'metodos', name: 'Métodos', color: '#7c5e3c' },
  { slug: 'graos', name: 'Grãos', color: '#5a3a22' },
];

const FIXED_POSTS: FixedPost[] = [
  {
    slug: 'o-metodo-v60-passo-a-passo',
    title: 'O método V60 passo a passo: parâmetros, técnica e erros comuns',
    excerpt:
      'Guia editorial completo do método V60: proporção, moagem, temperatura, tempo de extração, erros mais frequentes e como ajustar a receita ao seu paladar.',
    metaTitle: 'V60 passo a passo: parâmetros, técnica e erros comuns',
    metaDescription:
      'Tudo que você precisa saber pra fazer um V60 consistente em casa: proporção, moagem, temperatura, tempo e como ajustar.',
    keywords: ['v60', 'método-coado', 'café-especial', 'extração'],
    tags: ['v60', 'metodo-coado', 'iniciante'],
    categorySlug: 'metodos',
    categoryName: 'Métodos',
    format: 'how-to',
    featured: true,
    publishedAtDaysAgo: 1,
    faq: [
      {
        question: 'Qual proporção usar?',
        answer:
          'A referência da SCA é 60 g de café por litro de água — ou 1:16. Comece por aí e ajuste 1 g pra mais ou pra menos conforme o paladar.',
      },
      {
        question: 'Que tipo de moagem?',
        answer:
          'Média-fina, parecida com sal refinado. Se a água passa rápido demais, refine mais. Se trava, abra um pouco.',
      },
      {
        question: 'Quanto tempo deve durar a extração?',
        answer:
          '2 minutos e 30 segundos a 3 minutos no total, contando o bloom. Tempo muito curto = ácido; muito longo = amargo.',
      },
    ],
    content: `# O método V60 passo a passo

> Conteúdo de demonstração: simula um post gerado pela camada de IA. O slug e o conteúdo são fixos em ambiente local.

## Por que V60

O Hario V60 virou o método-coado mais popular entre cafeterias e baristas caseiros porque exige pouco equipamento, oferece controle preciso da extração e revela bem as notas mais delicadas dos cafés especiais.

## Equipamento mínimo

- **Suporte V60** (cerâmica, vidro, plástico ou metal — todos funcionam, com pequenas variações térmicas)
- **Filtros de papel** específicos para V60 (Hario originais ou compatíveis)
- **Moedor** com mós cônicas (a granulometria uniforme faz diferença)
- **Balança** com precisão de 0,1 g
- **Chaleira de bico fino** (idealmente com termômetro)

## Receita base (1 xícara)

| Variável        | Valor                       |
| --------------- | --------------------------- |
| Café            | 15 g                        |
| Água            | 240 g                       |
| Proporção       | 1:16                        |
| Moagem          | Média-fina                  |
| Temperatura     | 92–94 °C                    |
| Tempo total     | 2:30 a 3:00                 |

## Passo a passo

1. **Aqueça** o suporte e o filtro com água quente. Descarte essa água.
2. **Pese** 15 g de café e moa na hora.
3. **Coloque** o pó no filtro e nivele com pequenos toques.
4. **Bloom**: despeje 30 g de água, espere 30–45 segundos. Você vai ver a "esponja" subir — é o CO₂ saindo.
5. **Despeje** o restante em movimentos circulares lentos, do centro pra fora. Mantenha o nível constante.
6. **Aguarde** drenar completamente. Tempo total ideal: 2:30–3:00.

### Ponto de atenção

Não despeje a água nas bordas do filtro — você vai criar caminhos preferenciais e a extração fica desigual. Mantenha o despejo no centro.

## Erros mais comuns

- **Moagem errada**: o sintoma mais frequente. Muito fina → trava; muito grossa → aguado.
- **Água ruim**: TDS abaixo de 75 ppm ou acima de 250 ppm prejudica. Use água filtrada.
- **Café velho**: idealmente entre 7 e 30 dias após a torra.
- **Pular a balança**: estimar grama no olho compromete a repetibilidade.

## Como ajustar pelo paladar

| Sintoma             | Provável causa                | Ajuste                     |
| ------------------- | ----------------------------- | -------------------------- |
| Ácido demais        | Sub-extração                  | Moagem mais fina ou mais tempo |
| Amargo / seco       | Sobre-extração                | Moagem mais grossa ou menos tempo |
| Aguado / sem corpo  | Proporção muito baixa         | Aumente o café (1:15 ou 1:14) |
| Pesado / cansativo  | Proporção muito alta          | Reduza o café (1:17 ou 1:18) |

## Conclusão

Comece pela receita base e mude **uma variável por vez**. Em duas semanas você terá um V60 ajustado ao seu paladar — e vai conseguir replicar em qualquer canto.
`,
  },
  {
    slug: 'como-escolher-graos-especiais-iniciantes',
    title: 'Como escolher grãos especiais sem se perder no rótulo',
    excerpt:
      'Decifre o rótulo de café especial: torra, processo, varietal, fazenda, altitude e pontuação. Um guia direto para escolher melhor sem virar barista.',
    metaTitle: 'Como escolher grãos especiais sem se perder no rótulo',
    metaDescription:
      'Entenda os termos do rótulo de café especial — torra, processo, varietal, altitude — e escolha grãos com mais segurança.',
    keywords: ['café especial', 'grãos', 'torra', 'processo'],
    tags: ['graos', 'compra', 'iniciante'],
    categorySlug: 'graos',
    categoryName: 'Grãos',
    format: 'article',
    featured: true,
    publishedAtDaysAgo: 3,
    faq: [
      {
        question: 'Vale comprar café direto da torrefação?',
        answer:
          'Sim — é a forma mais segura de garantir frescor. A maioria das torrefações entrega entre 7 e 14 dias após a torra, faixa ideal de consumo.',
      },
      {
        question: 'Qual a diferença entre arábica e robusta?',
        answer:
          'Arábica tem mais doçura, acidez agradável e complexidade aromática. Robusta tem mais cafeína, mais corpo e gosto mais "duro". Café especial é majoritariamente arábica.',
      },
    ],
    content: `# Como escolher grãos especiais sem se perder no rótulo

> Conteúdo de demonstração: simula um post gerado pela camada de IA. O slug e o conteúdo são fixos em ambiente local.

## Por que o rótulo importa

No café especial, o rótulo carrega muito mais informação que no café tradicional. Saber lê-lo é o que permite escolher um grão que combina com o que você gosta — e não desperdiçar dinheiro em algo que não vai te agradar.

## Os campos que importam

### 1. Data de torra

O frescor é o fator mais determinante. Procure cafés torrados há **7 a 30 dias**. Antes disso, ainda está liberando CO₂ e fica difícil de extrair. Depois disso, perde aromas voláteis rapidamente.

### 2. Perfil de torra

- **Clara**: realça acidez e notas frutadas. Mais difícil de extrair.
- **Média**: equilíbrio entre acidez, doçura e amargor. A mais "segura" para começar.
- **Escura**: predomina amargor e corpo. Mascara defeitos do grão.

Em café especial, a tendência é torra clara a média.

### 3. Processo

Como o grão foi separado do fruto:

- **Natural** (ou cereja): seca com a polpa. Resulta em xícara mais doce e frutada.
- **Lavado**: polpa removida antes da secagem. Xícara mais limpa, ácida e elegante.
- **Honey** (ou cereja descascado): meio termo entre os dois.

### 4. Varietal

Algumas variedades comuns: **Bourbon**, **Catuaí**, **Mundo Novo**, **Geisha**, **Typica**. Cada uma tem perfil sensorial característico — mas a região e o processo geralmente influenciam mais do que o varietal puro.

### 5. Altitude e região

Cafés cultivados em altitudes mais altas (acima de 1200m) tendem a ter mais complexidade aromática e acidez mais elegante. Brasil, Colômbia, Etiópia, Quênia e Costa Rica são origens clássicas.

### 6. Pontuação SCA

Cafés especiais pontuam **80+** na escala SCA (Specialty Coffee Association). Acima de 85 já é excelente. Acima de 90 é raro e caro.

## Como começar com segurança

1. **Compre torrefações pequenas** próximas a você. O frescor é melhor.
2. **Comece com torra média e processo natural**: tendem a agradar paladar acostumado a café tradicional.
3. **Anote o que você bebe**: data, origem, processo, suas impressões. Em poucas semanas você descobre seu perfil preferido.

## Erros que custam caro

- Comprar 1 kg de uma vez de um café que você nunca provou.
- Estocar grãos por meses "pra economizar".
- Confundir "gourmet" com "especial" — são selos comerciais diferentes.

## Conclusão

Escolher grãos especiais é menos sobre pagar caro e mais sobre **comprar com frequência, em pequenas quantidades, de torrefações que cuidam do produto**. Com um pouco de leitura de rótulo e algumas semanas de testes, sua xícara melhora muito sem mudar de equipamento.
`,
  },
];

export async function seedDemoContent(): Promise<void> {
  const channel = await ensureChannel();

  if (env.NODE_ENV === 'development') {
    await ensureFixedDevPosts(channel);
  }
}

async function ensureChannel(): Promise<ChannelDoc & { _id: any }> {
  let channel = await Channel.findOne({ slug: CHANNEL_SLUG });
  if (!channel) {
    channel = await Channel.create({
      slug: CHANNEL_SLUG,
      name: 'Café com Método',
      niche: 'cafe',
      siteUrl: 'http://localhost:3001',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      active: true,
      publishFrequency: 'daily',
      publishTimes: ['09:00'],
      postsPerSlot: 1,
      publishWeekdays: [0, 1, 2, 3, 4, 5, 6],
      defaultAuthorName: 'Fernando',
    });
    logger.info({ slug: channel.slug }, 'demo channel created');
  }
  return channel as any;
}

async function ensureFixedDevPosts(channel: ChannelDoc & { _id: any }): Promise<void> {
  // 1. Categorias fixas (upsert)
  const categoriesBySlug = new Map<string, CategoryDoc & { _id: any }>();
  for (let i = 0; i < FIXED_CATEGORIES.length; i++) {
    const c = FIXED_CATEGORIES[i]!;
    const cat = await Category.findOneAndUpdate(
      { channelId: channel._id, slug: c.slug } as any,
      {
        $set: {
          channelId: channel._id,
          slug: c.slug,
          name: c.name,
          color: c.color,
          order: i,
          description: `Conteúdo da categoria ${c.name}.`,
        },
      },
      { upsert: true, new: true },
    );
    if (cat) categoriesBySlug.set(c.slug, cat as any);
  }

  // 2. Autor fixo Fernando (upsert)
  const authorSlug = 'fernando';
  const author = (await Author.findOneAndUpdate(
    { channelId: channel._id, slug: authorSlug } as any,
    {
      $set: {
        channelId: channel._id,
        slug: authorSlug,
        name: 'Fernando',
        jobTitle: 'Editor-chefe',
        shortBio: `Editor-chefe do ${channel.name}. Curador editorial responsável.`,
        bio: `# Fernando\n\nEditor-chefe do ${channel.name}. Curador editorial responsável pela seleção e revisão dos conteúdos publicados.`,
        expertise: [channel.niche],
        credentials: [],
        socials: {},
      },
    },
    { upsert: true, new: true },
  )) as AuthorDoc & { _id: any };

  // 3. Tags fixas (upsert)
  const allTagSlugs = Array.from(new Set(FIXED_POSTS.flatMap((p) => p.tags)));
  for (const slug of allTagSlugs) {
    await Tag.updateOne(
      { channelId: channel._id, slug } as any,
      { $setOnInsert: { channelId: channel._id, slug, name: slug.replace(/-/g, ' ') } },
      { upsert: true },
    ).catch(() => {});
  }

  // 4. Posts fixos (upsert por slug)
  for (const p of FIXED_POSTS) {
    const cat = categoriesBySlug.get(p.categorySlug);
    if (!cat) continue;
    const wc = countWords(p.content);
    const publishedAt = new Date(Date.now() - p.publishedAtDaysAgo * 24 * 60 * 60 * 1000);
    publishedAt.setHours(9, 0, 0, 0);

    await Post.findOneAndUpdate(
      { channelId: channel._id, slug: p.slug } as any,
      {
        $set: {
          channelId: channel._id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          format: p.format,
          status: 'published',
          authorId: author._id,
          categoryId: cat._id,
          tags: p.tags,
          coverImage: {
            url: `https://picsum.photos/seed/${encodeURIComponent(p.slug)}/1600/900`,
            alt: `Imagem ilustrativa: ${p.title.toLowerCase()}.`,
            width: 1600,
            height: 900,
          },
          gallery: [],
          metaTitle: p.metaTitle.slice(0, 70),
          metaDescription: p.metaDescription.slice(0, 180),
          keywords: p.keywords,
          faq: p.faq,
          howToSteps: [],
          references: [],
          language: channel.language,
          wordCount: wc,
          readingTimeMinutes: readingTimeMinutes(wc),
          publishedAt,
          featured: p.featured,
        },
      },
      { upsert: true, new: true },
    );
  }

  logger.info(
    { channel: channel.slug, posts: FIXED_POSTS.length, categories: FIXED_CATEGORIES.length },
    'fixed dev posts ensured',
  );
}
