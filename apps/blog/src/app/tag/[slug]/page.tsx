import Link from 'next/link';
import type { Metadata } from 'next';
import { listPosts } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PostCard } from '@/components/PostCard';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';
import { SITE_URL } from '@/lib/config';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Tag: ${slug}`,
    description: `Posts marcados com #${slug}.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const posts = await listPosts({ tag: slug, page, limit: 12 });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbLd([
            { name: 'Início', url: SITE_URL },
            { name: `#${slug}`, url: abs(`/tag/${slug}`) },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(collectionPageLd({
            name: `Tag: ${slug}`,
            url: abs(`/tag/${slug}`),
            posts: posts.items,
          })),
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Breadcrumb items={[{ href: '/', label: 'Início' }, { label: `#${slug}` }]} />
        <h1 className="serif text-3xl md:text-4xl font-bold mt-4 mb-2">#{slug}</h1>
        <p className="text-[var(--color-muted)] mb-8">{posts.total} resultado(s)</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.items.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        {posts.totalPages > 1 ? (
          <nav className="mt-8 flex items-center justify-between" aria-label="Paginação">
            {page > 1 ? (
              <Link href={`/tag/${slug}?page=${page - 1}` as any} className="text-sm hover:underline">← Anterior</Link>
            ) : <span />}
            <span className="text-xs text-[var(--color-muted)]">Página {page} de {posts.totalPages}</span>
            {page < posts.totalPages ? (
              <Link href={`/tag/${slug}?page=${page + 1}` as any} className="text-sm hover:underline">Próxima →</Link>
            ) : <span />}
          </nav>
        ) : null}
      </div>
    </>
  );
}
