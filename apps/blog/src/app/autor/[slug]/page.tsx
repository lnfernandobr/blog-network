import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { authorMetadata, jsonLd, abs } from '@/lib/seo';
import { breadcrumbLd, personLd } from '@/lib/jsonld';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PostCard } from '@/components/PostCard';
import { getAuthor, getChannel, listPosts } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';
import { SITE_URL } from '@/lib/config';

export const revalidate = 600;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [author, channel] = await Promise.all([getAuthor(slug), getChannel()]);
  if (!author) return { title: 'Autor não encontrado' };
  return authorMetadata(channel, author);
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const [author, posts] = await Promise.all([
    getAuthor(slug),
    listPosts({ author: slug, limit: 12 }),
  ]);
  if (!author) notFound();
  const bioHtml = author.bio ? renderMarkdown(author.bio) : '';
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personLd(author)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbLd([
            { name: 'Início', url: SITE_URL },
            { name: 'Autores', url: abs('/autores') },
            { name: author.name, url: abs(`/autor/${author.slug}`) },
          ])),
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Breadcrumb
          items={[
            { href: '/', label: 'Início' },
            { href: '/autores', label: 'Autores' },
            { label: author.name },
          ]}
        />
        <header className="mt-6 flex items-start gap-6 max-w-3xl">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.name}
              width={120}
              height={120}
              className="rounded-full"
            />
          ) : null}
          <div>
            <h1 className="serif text-3xl md:text-4xl font-bold">{author.name}</h1>
            {author.jobTitle ? <p className="text-[var(--color-muted)]">{author.jobTitle}</p> : null}
            {author.shortBio ? <p className="mt-2">{author.shortBio}</p> : null}
            {author.expertise && author.expertise.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {author.expertise.map((e) => (
                  <li key={e} className="text-xs px-2 py-1 rounded-full bg-[var(--color-card)] border">{e}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        {bioHtml ? (
          <section className="mt-8 max-w-3xl prose-editorial" dangerouslySetInnerHTML={{ __html: bioHtml }} />
        ) : null}

        {author.credentials && author.credentials.length > 0 ? (
          <section className="mt-8 max-w-3xl">
            <h2 className="serif text-xl font-bold mb-2">Credenciais</h2>
            <ul className="list-disc pl-6 text-sm space-y-1">
              {author.credentials.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="serif text-2xl font-bold mb-6">Posts de {author.name}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.items.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
          {posts.items.length === 0 ? (
            <p className="text-[var(--color-muted)]">Nenhum post publicado ainda.</p>
          ) : null}
        </section>
      </div>
    </>
  );
}
