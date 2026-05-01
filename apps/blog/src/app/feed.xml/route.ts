import { Feed } from 'feed';
import { getChannel, listPosts } from '@/lib/api';
import { SITE_URL } from '@/lib/config';

export const revalidate = 600;

export async function GET() {
  return new Response(await buildFeed('rss'), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}

export async function buildFeed(kind: 'rss' | 'atom'): Promise<string> {
  const [channel, posts] = await Promise.all([getChannel(), listPosts({ limit: 30 })]);
  const feed = new Feed({
    title: channel.name,
    description: `${channel.name} — conteúdo editorial sobre ${channel.niche}.`,
    id: `${SITE_URL}/`,
    link: `${SITE_URL}/`,
    language: channel.language || 'pt-BR',
    copyright: `© ${new Date().getFullYear()} ${channel.name}`,
    updated: new Date(),
    feedLinks: { rss2: `${SITE_URL}/feed.xml`, atom: `${SITE_URL}/atom.xml` },
    author: { name: channel.name },
  });
  for (const p of posts.items) {
    feed.addItem({
      title: p.title,
      id: `${SITE_URL}/posts/${p.slug}`,
      link: `${SITE_URL}/posts/${p.slug}`,
      description: p.excerpt,
      content: p.excerpt,
      author: p.author ? [{ name: p.author.name, link: `${SITE_URL}/autor/${p.author.slug}` }] : undefined,
      date: new Date(p.publishedAt ?? p.updatedAt ?? p.createdAt),
      image: p.coverImage.url,
      category: p.tags.map((t) => ({ name: t })),
    });
  }
  return kind === 'rss' ? feed.rss2() : feed.atom1();
}
