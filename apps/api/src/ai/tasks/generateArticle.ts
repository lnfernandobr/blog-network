import { logger } from '../../config/logger.js';
import { prompts, type ArticlePromptInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson, slugify } from './shared.js';

export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  format: 'article' | 'how-to' | 'list' | 'review' | 'opinion';
  faq: { question: string; answer: string }[];
}

export async function generateArticle(input: ArticlePromptInput): Promise<GeneratedArticle> {
  const provider = getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.article.system },
      { role: 'user', content: prompts.article.user(input) },
    ],
  });
  const data = parseJson<Partial<GeneratedArticle>>(result.text);
  if (!data.title || !data.content) {
    logger.error({ result }, 'AI article generation returned invalid payload');
    throw new Error('AI article generation: missing title/content');
  }

  const title = String(data.title);
  const slug = (data.slug && /^[a-z0-9-]+$/.test(data.slug) ? data.slug : slugify(title)).slice(0, 80);
  const format =
    data.format && ['article', 'how-to', 'list', 'review', 'opinion'].includes(data.format)
      ? (data.format as GeneratedArticle['format'])
      : 'article';

  const excerpt = (data.excerpt ?? title).toString().slice(0, 400);

  return {
    title,
    slug,
    excerpt,
    content: String(data.content),
    metaTitle: (data.metaTitle ?? title).toString().slice(0, 70),
    metaDescription: (data.metaDescription ?? excerpt).toString().slice(0, 180),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String).slice(0, 10) : [],
    format,
    faq: Array.isArray(data.faq)
      ? data.faq
          .filter((f): f is { question: string; answer: string } => Boolean(f?.question && f?.answer))
          .slice(0, 8)
      : [],
  };
}
