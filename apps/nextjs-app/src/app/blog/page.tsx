import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import StripeImage from '@/components/StripeImage';
import { getCategory, getChannel, listCategories, listPosts, searchPosts } from '@/lib/api';
import { adaptPost } from '@/lib/adapt';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';

interface PageProps {
  searchParams: Promise<{ cat?: string; q?: string; page?: string }>;
}

export const revalidate = 120;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const channel = await getChannel();
  if (sp.cat) {
    const c = await getCategory(sp.cat);
    if (c) {
      return {
        title: `${c.name} — ${channel.name}`,
        description: c.description ?? `Artigos sobre ${c.name}.`,
        alternates: { canonical: abs(`/blog?cat=${c.slug}`) },
      };
    }
  }
  if (sp.q) {
    return {
      title: `Busca: ${sp.q}`,
      description: `Resultados para "${sp.q}".`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: 'Blog',
    description: `Artigos do ${channel.name}.`,
    alternates: { canonical: abs('/blog') },
  };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 12;

  const [channel, cats] = await Promise.all([getChannel(), listCategories()]);

  const list = sp.q
    ? await searchPosts(sp.q, page, limit)
    : await listPosts({
        page,
        limit,
        ...(sp.cat ? { category: sp.cat } : {}),
      });

  const items = list.items.map(adaptPost);
  const activeCat = sp.cat ?? 'all';
  const baseHref = sp.q ? `/blog?q=${encodeURIComponent(sp.q)}` : `/blog${activeCat !== 'all' ? `?cat=${activeCat}` : ''}`;

  const pageTitle = sp.q
    ? `Busca: "${sp.q}"`
    : sp.cat
      ? cats.find((c) => c.slug === sp.cat)?.name ?? 'Categoria'
      : 'Tudo que escrevemos sobre o sono.';

  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Blog', url: abs('/blog') },
      ...(sp.cat ? [{ name: pageTitle, url: abs(`/blog?cat=${sp.cat}`) }] : []),
    ]),
    collectionPageLd({
      name: typeof pageTitle === 'string' ? pageTitle : 'Blog',
      url: abs(baseHref),
      posts: list.items,
    }),
  ];

  return (
    <main>
      {ld.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      ))}

      <header style={{ padding: '54px 24px 8px', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← início</Link>
        <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>{list.total} artigos</span>
      </header>

      <section style={{ padding: '24px 24px 0' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>{sp.q ? 'Busca' : 'Biblioteca'}</div>
        <h1 className="serif-h1" style={{ fontSize: 34, marginBottom: 18 }}>{pageTitle}</h1>
      </section>

      <form action="/blog" method="get" style={{ padding: '0 24px 14px' }}>
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Buscar artigos…"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--ink-dusk)',
            border: '0.5px solid var(--text-ghost)',
            borderRadius: 99,
            color: 'var(--text-moon)',
            fontFamily: 'inherit',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </form>

      <div style={{ display: 'flex', gap: 8, padding: '6px 24px 22px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[{ slug: 'all', name: 'Todos' }, ...cats].map((c) => {
          const active = (c.slug === 'all' && !sp.cat) || sp.cat === c.slug;
          const href = c.slug === 'all' ? '/blog' : `/blog?cat=${c.slug}`;
          return (
            <Link
              key={c.slug}
              href={href}
              style={{
                padding: '8px 14px',
                borderRadius: 99,
                background: active ? 'var(--amber-glow)' : 'var(--ink-dusk)',
                color: active ? 'var(--ink-void)' : 'var(--text-dim)',
                border: '0.5px solid ' + (active ? 'transparent' : 'var(--text-ghost)'),
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '32px 24px', color: 'var(--text-dim)' }}>
          <p className="serif-body">Nenhum artigo encontrado.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/blog/${p.slug}`}>
                {p.coverUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 12, overflow: 'hidden' }}>
                    <Image
                      src={p.coverUrl}
                      alt={p.coverAlt ?? p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <StripeImage height={150} label={p.id} tone={p.tone} />
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
                  <span className={`tag tag-${p.catTone}`}>{p.catLabel}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>· {p.minutes} min</span>
                </div>
                <h2 className="serif-h2" style={{ fontSize: 21, marginBottom: 6 }}>{p.title}</h2>
                <p className="serif-body" style={{ fontSize: 14, margin: 0 }}>{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {list.totalPages > 1 && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 24px 16px' }}>
          {page > 1 ? (
            <Link className="btn-ghost" href={`${baseHref}${baseHref.includes('?') ? '&' : '?'}page=${page - 1}`}>← Anterior</Link>
          ) : <span />}
          <span style={{ color: 'var(--text-faint)', fontSize: 12, alignSelf: 'center' }}>página {page} de {list.totalPages}</span>
          {page < list.totalPages ? (
            <Link className="btn-ghost" href={`${baseHref}${baseHref.includes('?') ? '&' : '?'}page=${page + 1}`}>Próxima →</Link>
          ) : <span />}
        </nav>
      )}
    </main>
  );
}
