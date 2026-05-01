import { Post } from '../models/Post.js';
import { countWords, readingTimeMinutes } from '../utils/readingTime.js';
import { revalidateChannel } from '../services/revalidate.js';
import type { PipelineStep } from './types.js';

export const publishPostStep: PipelineStep = async (ctx) => {
  const { channel, article, cover, author, category, tagSlugs } = ctx;
  if (!article || !cover || !author || !category) {
    throw new Error('publishPost: missing required context (article/cover/author/category)');
  }

  // Garante slug único no canal: se houver colisão, anexa timestamp curto.
  let slug = article.slug;
  if (await Post.exists({ channelId: channel._id, slug } as any)) {
    slug = `${slug}-${Date.now().toString(36).slice(-5)}`.slice(0, 80);
  }

  const wc = countWords(article.content);
  const post = await Post.create({
    channelId: channel._id,
    slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    format: article.format,
    status: 'published',
    authorId: author._id,
    categoryId: category._id,
    tags: tagSlugs ?? [],
    coverImage: cover,
    gallery: [],
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    keywords: article.keywords,
    faq: article.faq,
    howToSteps: [],
    references: [],
    language: channel.language,
    wordCount: wc,
    readingTimeMinutes: readingTimeMinutes(wc),
    publishedAt: new Date(),
    featured: false,
  } as any);

  ctx.post = post as any;
  await revalidateChannel(String(channel._id), post.slug);
};
