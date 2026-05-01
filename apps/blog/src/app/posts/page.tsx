import Link from 'next/link';
import type { Metadata } from 'next';
import { listCategories, listPosts } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';
import { SITE_URL } from '@/lib/config';

export const revalidate = 300;

interface PageProps { searchParams: Promise<{ page?: string }> }

export const metadata: Metadata = {
  title: 'Todos os posts',
  description: 'Lista completa de artigos publicados.',
  alternates: { canonical: '/posts' },
};

export default async function PostsIndex({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const [{ items, totalPages, total }, categories] = await Promise.all([
    listPosts({ page, limit: 12 }),
    listCategories(),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([{ name: 'Início', url: SITE_URL }, { name: 'Posts', url: abs('/posts') }])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionPageLd({ name: 'Todos os posts', url: abs('/posts'), posts: items })) }} />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Breadcrumb items={[{ href: '/', label: 'Início' }, { label: 'Posts' }]} />
        <header className="mt-4 mb-8">
          <h1 className="serif text-3xl md:text-4xl font-bold">Todos os posts</h1>
          <p className="text-[var(--color-muted)] mt-1">{total} artigos publicados</p>
        </header>
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <section>
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
            {totalPages > 1 ? (
              <nav className="mt-8 flex items-center justify-between" aria-label="Paginação">
                {page > 1 ? (
                  <Link href={`/posts?page=${page - 1}` as any} className="text-sm hover:underline">← Página anterior</Link>
                ) : <span />}
                <span className="text-xs text-[var(--color-muted)]">Página {page} de {totalPages}</span>
                {page < totalPages ? (
                  <Link href={`/posts?page=${page + 1}` as any} className="text-sm hover:underline">Próxima página →</Link>
                ) : <span />}
              </nav>
            ) : null}
          </section>
          <aside className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">Categorias</h2>
              <ul className="space-y-1.5 text-sm">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/categoria/${c.slug}` as any} className="hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
