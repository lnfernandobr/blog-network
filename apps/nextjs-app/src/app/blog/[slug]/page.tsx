import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import StripeImage from '@/components/StripeImage';
import PostTOC from '@/components/PostTOC';
import { getChannel, getPost, getRelated, getSitemapData } from '@/lib/api';
import { adaptPost } from '@/lib/adapt';
import { extractToc, renderMarkdown } from '@/lib/markdown';
import { abs, jsonLd, postMetadata } from '@/lib/seo';
import { articleLd, breadcrumbLd, faqLd } from '@/lib/jsonld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 120;

export async function generateStaticParams() {
  const data = await getSitemapData();
  return data.posts.slice(0, 100).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [channel, post] = await Promise.all([getChannel(), getPost(slug)]);
  if (!post) return { title: 'Não encontrado', robots: { index: false, follow: false } };
  return postMetadata(channel, post, post.author);
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const [channel, post] = await Promise.all([getChannel(), getPost(slug)]);
  if (!post) return notFound();

  const ui = adaptPost(post);
  const related = (await getRelated(slug, 3)).map(adaptPost);

  const toc = extractToc(post.content);
  const html = renderMarkdown(post.content);

  const ld: unknown[] = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Blog', url: abs('/blog') },
      ...(post.category ? [{ name: post.category.name, url: abs(`/blog?cat=${post.category.slug}`) }] : []),
      { name: post.title, url: abs(`/blog/${post.slug}`) },
    ]),
    articleLd(channel, post, post.author),
  ];
  const faq = faqLd(post);
  if (faq) ld.push(faq);

  return (
    <main>
      {ld.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      ))}

      <header style={{ padding: '54px 24px 8px' }}>
        <Link href="/blog" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← biblioteca</Link>
      </header>

      <article style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
          <span className={`tag tag-${ui.catTone}`}>{ui.catLabel}</span>
          <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>· {ui.minutes} min de leitura</span>
        </div>
        <h1 className="serif-h1" style={{ fontSize: 32, marginBottom: 18 }}>{post.title}</h1>
        {post.excerpt && (
          <p className="serif-body" style={{ fontSize: 17, color: 'var(--text-dim)', margin: '0 0 22px' }}>{post.excerpt}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--ink-fog)', overflow: 'hidden', position: 'relative' }}>
            {post.author?.avatarUrl && (
              <Image src={post.author.avatarUrl} alt={post.author.name} fill sizes="32px" style={{ objectFit: 'cover' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-moon)' }}>{ui.author}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{ui.date}</div>
          </div>
        </div>

        {post.coverImage?.url ? (
          <div style={{ position: 'relative', width: '100%', height: 240, borderRadius: 14, overflow: 'hidden' }}>
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        ) : (
          <StripeImage height={220} label={ui.id} tone={ui.tone} />
        )}
      </article>

      {toc.length >= 3 && (
        <PostTOC sections={toc.filter((t) => t.depth === 2).map((t) => ({ id: t.id, title: t.text }))} />
      )}

      <div className="article-body" style={{ padding: '32px 24px 0' }} dangerouslySetInnerHTML={{ __html: html }} />

      {post.faq && post.faq.length > 0 && (
        <section style={{ padding: '40px 24px 0' }}>
          <div className="kicker" style={{ marginBottom: 12 }}>Perguntas frequentes</div>
          <h2 className="serif-h2" style={{ fontSize: 22, marginBottom: 18 }}>FAQ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {post.faq.map((f, i) => (
              <details
                key={i}
                style={{
                  background: 'var(--ink-dusk)',
                  border: '0.5px solid var(--text-ghost)',
                  borderRadius: 12,
                  padding: '14px 18px',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 16,
                    color: 'var(--text-moon)',
                    listStyle: 'none',
                  }}
                >
                  {f.question}
                </summary>
                <p className="serif-body" style={{ fontSize: 15, marginTop: 10, marginBottom: 0 }}>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section
          style={{
            margin: '48px 24px 0',
            padding: '24px',
            background: 'var(--ink-dusk)',
            border: '0.5px solid var(--text-ghost)',
            borderRadius: 16,
          }}
        >
          <div className="kicker" style={{ marginBottom: 10 }}>Continue lendo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {related.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} style={{ display: 'flex', gap: 12 }}>
                {p.coverUrl ? (
                  <div style={{ position: 'relative', width: 70, height: 70, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <Image src={p.coverUrl} alt={p.coverAlt ?? p.title} fill sizes="70px" style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <StripeImage width={70} height={70} label="" tone={p.tone} radius={8} />
                )}
                <div style={{ flex: 1 }}>
                  <span className={`tag tag-${p.catTone}`} style={{ fontSize: 9, padding: '2px 8px' }}>{p.catLabel}</span>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.25, marginTop: 6 }}>{p.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
