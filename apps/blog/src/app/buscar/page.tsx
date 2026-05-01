import type { Metadata } from 'next';
import { searchPosts } from '@/lib/api';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PostCard } from '@/components/PostCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Buscar',
  description: 'Buscar artigos no blog.',
  alternates: { canonical: '/buscar' },
};

interface Props { searchParams: Promise<{ q?: string; page?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page ?? 1));
  const result = q.length >= 2 ? await searchPosts(q, page, 12) : null;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <Breadcrumb items={[{ href: '/', label: 'Início' }, { label: 'Buscar' }]} />
      <h1 className="serif text-3xl md:text-4xl font-bold mt-4">Buscar</h1>
      <form action="/buscar" method="get" className="mt-4 max-w-xl flex gap-2">
        <label htmlFor="q" className="sr-only">Termo de busca</label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Digite o que você procura…"
          className="flex-1 h-10 rounded-md border bg-[var(--color-card)] px-3 text-sm"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-medium"
        >
          Buscar
        </button>
      </form>

      <section className="mt-8">
        {!q ? (
          <p className="text-[var(--color-muted)]">Digite ao menos 2 caracteres.</p>
        ) : result && result.items.length === 0 ? (
          <p className="text-[var(--color-muted)]">Nada encontrado para “{q}”.</p>
        ) : result ? (
          <>
            <p className="text-sm text-[var(--color-muted)] mb-6">
              {result.total} resultado(s) para “{q}”
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
