import { getChannel, listCategories, listPosts } from '@/lib/api';
import { SITE_URL } from '@/lib/config';

export const revalidate = 600;

export async function GET() {
  const [channel, categories, recent, featured] = await Promise.all([
    getChannel(),
    listCategories(),
    listPosts({ limit: 30 }),
    listPosts({ featured: true, limit: 8 }),
  ]);

  const lines: string[] = [];
  lines.push(`# ${channel.name}`);
  lines.push('');
  lines.push(`> Conteúdo editorial sobre ${channel.niche}.`);
  lines.push('');
  lines.push(`Idioma: ${channel.language}`);
  lines.push(`Site: ${SITE_URL}`);
  lines.push(`Política editorial: ${SITE_URL}/politica-editorial`);
  lines.push(`Sobre: ${SITE_URL}/sobre`);
  lines.push('');

  if (featured.items.length > 0) {
    lines.push('## Posts em destaque');
    lines.push('');
    for (const p of featured.items) {
      lines.push(`- [${p.title}](${SITE_URL}/posts/${p.slug}): ${p.excerpt}`);
    }
    lines.push('');
  }

  lines.push('## Categorias');
  lines.push('');
  for (const c of categories) {
    const desc = c.description ? `: ${c.description}` : '';
    lines.push(`- [${c.name}](${SITE_URL}/categoria/${c.slug})${desc}`);
  }
  lines.push('');

  lines.push('## Posts recentes');
  lines.push('');
  for (const p of recent.items) {
    const author = p.author ? ` — por ${p.author.name}` : '';
    lines.push(`- [${p.title}](${SITE_URL}/posts/${p.slug})${author}: ${p.excerpt}`);
  }
  lines.push('');

  lines.push('## Feeds e descoberta');
  lines.push('');
  lines.push(`- Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push(`- RSS: ${SITE_URL}/feed.xml`);
  lines.push(`- Atom: ${SITE_URL}/atom.xml`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
