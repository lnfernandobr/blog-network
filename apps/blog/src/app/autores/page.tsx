import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { listAuthors } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';
import { SITE_URL } from '@/lib/config';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Autores',
  description: 'Conheça quem produz conteúdo aqui.',
  alternates: { canonical: '/autores' },
};

export default async function AuthorsIndex() {
  const authors = await listAuthors();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbLd([
            { name: 'Início', url: SITE_URL },
            { name: 'Autores', url: abs('/autores') },
          ])),
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Breadcrumb items={[{ href: '/', label: 'Início' }, { label: 'Autores' }]} />
        <h1 className="serif text-3xl md:text-4xl font-bold mt-4 mb-8">Autores</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((a) => (
            <Link
              key={a.id}
              href={`/autor/${a.slug}` as any}
              className="rounded-lg border bg-[var(--color-card)] p-5 hover:shadow-md flex gap-4"
            >
              {a.avatarUrl ? (
                <Image
                  src={a.avatarUrl}
                  alt={a.name}
                  width={64}
                  height={64}
                  className="rounded-full h-16 w-16 object-cover shrink-0"
                />
              ) : null}
              <div>
                <h2 className="serif font-semibold text-lg">{a.name}</h2>
                {a.jobTitle ? (
                  <p className="text-xs text-[var(--color-muted)]">{a.jobTitle}</p>
                ) : null}
                <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-3">{a.shortBio}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
