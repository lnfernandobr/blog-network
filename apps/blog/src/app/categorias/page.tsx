import Link from 'next/link';
import type { Metadata } from 'next';
import { listCategories } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';
import { SITE_URL } from '@/lib/config';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Navegue por todas as categorias do blog.',
  alternates: { canonical: '/categorias' },
};

export default async function CategoriesIndex() {
  const categories = await listCategories();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbLd([
            { name: 'Início', url: SITE_URL },
            { name: 'Categorias', url: abs('/categorias') },
          ])),
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Breadcrumb items={[{ href: '/', label: 'Início' }, { label: 'Categorias' }]} />
        <h1 className="serif text-3xl md:text-4xl font-bold mt-4 mb-2">Categorias</h1>
        <p className="text-[var(--color-muted)] mb-8">Encontre artigos agrupados por tema.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}` as any}
              className="rounded-lg border bg-[var(--color-card)] p-5 hover:shadow-md"
            >
              <span
                className="inline-block h-2 w-10 rounded-full mb-3"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              <h2 className="serif font-semibold text-lg">{c.name}</h2>
              <p className="text-sm text-[var(--color-muted)] line-clamp-3 mt-1">
                {c.description ?? `Posts da categoria ${c.name}.`}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
