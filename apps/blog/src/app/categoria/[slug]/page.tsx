import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categoryMetadata, jsonLd, abs } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PostCard } from '@/components/PostCard';
import { getCategory, getChannel, listPosts } from '@/lib/api';
import { SITE_URL } from '@/lib/config';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [cat, channel] = await Promise.all([getCategory(slug), getChannel()]);
  if (!cat) return { title: 'Categoria não encontrada' };
  return categoryMetadata(channel, cat);
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const [cat, posts] = await Promise.all([
    getCategory(slug),
    listPosts({ category: slug, page, limit: 12 }),
  ]);
  if (!cat) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbLd([
            { name: 'Início', url: SITE_URL },
            { name: 'Categorias', url: abs('/categorias') },
            { name: cat.name, url: abs(`/categoria/${cat.slug}`) },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(collectionPageLd({
            name: cat.name,
            description: cat.description,
            url: abs(`/categoria/${cat.slug}`),
            posts: posts.items,
          })),
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Breadcrumb
          items={[
            { href: '/', label: 'Início' },
            { href: '/categorias', label: 'Categorias' },
            { label: cat.name },
          ]}
        />
        <header className="mt-4 mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">Categoria</p>
          <h1 className="serif text-4xl md:text-5xl font-bold mt-2">{cat.name}</h1>
          {cat.description ? (
            <p className="mt-3 text-lg text-[var(--color-muted)]">{cat.description}</p>
          ) : null}
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.items.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        {posts.items.length === 0 ? (
          <p className="text-[var(--color-muted)]">Sem posts publicados ainda.</p>
        ) : null}
        {posts.totalPages > 1 ? (
          <nav className="mt-8 flex items-center justify-between" aria-label="Paginação">
            {page > 1 ? (
              <Link href={`/categoria/${slug}?page=${page - 1}` as any} className="text-sm hover:underline">← Anterior</Link>
            ) : <span />}
            <span className="text-xs text-[var(--color-muted)]">Página {page} de {posts.totalPages}</span>
            {page < posts.totalPages ? (
              <Link href={`/categoria/${slug}?page=${page + 1}` as any} className="text-sm hover:underline">Próxima →</Link>
            ) : <span />}
          </nav>
        ) : null}
      </div>
    </>
  );
}
