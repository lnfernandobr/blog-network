import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getChannel, getPost, getRelated, listCategories } from '@/lib/api';
import { jsonLd, postMetadata, abs } from '@/lib/seo';
import { articleLd, breadcrumbLd, faqLd } from '@/lib/jsonld';
import { extractToc, renderMarkdown } from '@/lib/markdown';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PostCard } from '@/components/PostCard';
import { SITE_URL } from '@/lib/config';

interface Params { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [post, channel] = await Promise.all([getPost(slug), getChannel()]);
  if (!post) return { title: 'Post não encontrado' };
  return postMetadata(channel, post, post.author);
}

export const revalidate = 300;

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, channel] = await Promise.all([getPost(slug), getChannel()]);
  if (!post) notFound();
  const [related, _categories] = await Promise.all([getRelated(slug), listCategories()]);
  const html = renderMarkdown(post.content);
  const toc = extractToc(post.content);
  const articleSchema = articleLd(channel, post, post.author);
  const faqSchema = faqLd(post);
  const breadcrumb = breadcrumbLd([
    { name: 'Início', url: SITE_URL },
    ...(post.category ? [{ name: post.category.name, url: abs(`/categoria/${post.category.slug}`) }] : []),
    { name: post.title, url: abs(`/posts/${post.slug}`) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
        />
      ) : null}

      <article className="container mx-auto max-w-screen-xl px-4 py-8 lg:py-10">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { href: '/', label: 'Início' },
              ...(post.category
                ? [{ href: `/categoria/${post.category.slug}`, label: post.category.name }]
                : []),
              { label: post.title },
            ]}
          />
        </div>

        <header className="max-w-3xl">
          {post.category ? (
            <Link
              href={`/categoria/${post.category.slug}` as any}
              className="text-xs uppercase tracking-widest text-[var(--color-accent)]"
            >
              {post.category.name}
            </Link>
          ) : null}
          <h1 className="serif text-3xl md:text-5xl font-bold leading-tight mt-3">{post.title}</h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)] border-t pt-4">
            {post.author ? (
              <Link href={`/autor/${post.author.slug}` as any} className="flex items-center gap-2 hover:text-[var(--color-fg)]">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : null}
                <span className="font-medium text-[var(--color-fg)]">{post.author.name}</span>
              </Link>
            ) : null}
            {post.publishedAt ? (
              <span>
                Publicado em{' '}
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </span>
            ) : null}
            {post.updatedAtContent && post.updatedAtContent !== post.publishedAt ? (
              <span>
                · Atualizado em{' '}
                <time dateTime={post.updatedAtContent}>
                  {new Date(post.updatedAtContent).toLocaleDateString('pt-BR')}
                </time>
              </span>
            ) : null}
            <span>· {post.readingTimeMinutes} min de leitura</span>
            <span>· {post.wordCount} palavras</span>
          </div>
        </header>

        <figure className="mt-8 rounded-xl overflow-hidden border bg-black/5">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </div>
          {post.coverImage.caption ? (
            <figcaption className="text-xs text-[var(--color-muted)] p-3">
              {post.coverImage.caption}
              {post.coverImage.credit ? <> · <em>{post.coverImage.credit}</em></> : null}
            </figcaption>
          ) : null}
        </figure>

        <div className="mt-10 grid lg:grid-cols-[1fr_280px] gap-12">
          <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: html }} />
          {toc.length > 0 ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
                  Sumário
                </h2>
                <nav aria-label="Sumário">
                  <ol className="text-sm space-y-2">
                    {toc.map((t) => (
                      <li
                        key={t.id}
                        className="leading-tight"
                        style={{ paddingLeft: `${(t.depth - 2) * 0.75}rem` }}
                      >
                        <a
                          href={`#${t.id}`}
                          className="text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                        >
                          {t.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
                {post.tags.length > 0 ? (
                  <div className="mt-6 pt-6 border-t">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
                      Tags
                    </h2>
                    <ul className="flex flex-wrap gap-1.5">
                      {post.tags.map((t) => (
                        <li key={t}>
                          <Link
                            href={`/tag/${t}` as any}
                            className="text-xs px-2 py-1 rounded-full bg-[var(--color-card)] border hover:bg-[var(--color-accent)]/10"
                          >
                            #{t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          ) : null}
        </div>

        {post.faq && post.faq.length > 0 ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="serif text-2xl font-bold border-b pb-2 mb-4">Perguntas frequentes</h2>
            <div className="space-y-3">
              {post.faq.map((q, i) => (
                <details key={i} className="rounded-md border bg-[var(--color-card)] p-4">
                  <summary className="font-medium cursor-pointer">{q.question}</summary>
                  <p className="mt-2 text-[var(--color-muted)]">{q.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {post.references && post.references.length > 0 ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="serif text-2xl font-bold border-b pb-2 mb-4">Fontes e referências</h2>
            <ul className="space-y-2 text-sm">
              {post.references.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noopener" className="underline">
                    {r.title}
                  </a>
                  {r.publisher ? <span className="text-[var(--color-muted)]"> — {r.publisher}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {post.author && post.author.bio ? (
          <section
            aria-label={`Sobre o autor ${post.author.name}`}
            className="mt-12 max-w-3xl rounded-xl border bg-[var(--color-card)] p-6"
          >
            <div className="flex items-start gap-4">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : null}
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Sobre o autor</p>
                <h2 className="serif text-xl font-bold">
                  <Link href={`/autor/${post.author.slug}` as any} className="hover:underline">
                    {post.author.name}
                  </Link>
                </h2>
                {post.author.jobTitle ? (
                  <p className="text-sm text-[var(--color-muted)]">{post.author.jobTitle}</p>
                ) : null}
                <p className="text-sm mt-2">{post.author.shortBio}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-label="Compartilhar" className="mt-10 max-w-3xl flex items-center gap-3 text-sm">
          <span className="text-[var(--color-muted)]">Compartilhar:</span>
          <a
            target="_blank"
            rel="noopener"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(abs(`/posts/${post.slug}`))}&text=${encodeURIComponent(post.title)}`}
            className="hover:underline"
          >
            Twitter
          </a>
          <a
            target="_blank"
            rel="noopener"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(abs(`/posts/${post.slug}`))}`}
            className="hover:underline"
          >
            Facebook
          </a>
          <a
            target="_blank"
            rel="noopener"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(abs(`/posts/${post.slug}`))}`}
            className="hover:underline"
          >
            LinkedIn
          </a>
        </section>

        <section aria-label="Comentários" className="mt-10 max-w-3xl rounded-xl border bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-muted)]">
          Comentários estarão disponíveis em breve.
        </section>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="serif text-2xl font-bold mb-6">Continuar lendo</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
