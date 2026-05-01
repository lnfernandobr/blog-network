import Link from 'next/link';
import Image from 'next/image';
import { getChannel, listCategories, listPosts } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { jsonLd, abs } from '@/lib/seo';
import { breadcrumbLd, collectionPageLd } from '@/lib/jsonld';
import { SITE_URL } from '@/lib/config';

export const revalidate = 300;

export default async function HomePage() {
  const [channel, categories, featured, recent] = await Promise.all([
    getChannel(),
    listCategories(),
    listPosts({ featured: true, limit: 3 }),
    listPosts({ limit: 9 }),
  ]);

  const heroPost = featured.items[0] ?? recent.items[0];
  const otherFeatured = featured.items.slice(1, 3);
  const remaining = recent.items
    .filter((p) => !featured.items.some((f) => f.id === p.id))
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([{ name: 'Início', url: SITE_URL }]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            collectionPageLd({
              name: channel.name,
              description: `${channel.name} — conteúdo editorial sobre ${channel.niche}.`,
              url: SITE_URL,
              posts: recent.items,
            }),
          ),
        }}
      />

      <section className="border-b">
        <div className="container mx-auto max-w-screen-xl px-4 py-12 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">
              {channel.niche}
            </p>
            <h1 className="serif text-4xl md:text-5xl lg:text-6xl font-bold mt-3 leading-[1.1]">
              {channel.name}
            </h1>
            <p className="mt-4 text-lg text-[var(--color-muted)] max-w-2xl">
              Conteúdo editorial sobre {channel.niche}, atualizado com regularidade.
            </p>
          </div>
        </div>
      </section>

      {heroPost ? (
        <section aria-label="Destaque" className="container mx-auto max-w-screen-xl px-4 py-10">
          <div className="grid lg:grid-cols-5 gap-8">
            <article className="lg:col-span-3">
              <Link href={`/posts/${heroPost.slug}` as any} className="group block">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border bg-black/5">
                  <Image
                    src={heroPost.coverImage.url}
                    alt={heroPost.coverImage.alt}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    priority
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-5">
                  {heroPost.category ? (
                    <p className="text-xs uppercase tracking-wide text-[var(--color-accent)] mb-1">
                      {heroPost.category.name}
                    </p>
                  ) : null}
                  <h2 className="serif text-3xl md:text-4xl font-bold leading-tight group-hover:underline">
                    {heroPost.title}
                  </h2>
                  <p className="mt-3 text-[var(--color-muted)] line-clamp-3">{heroPost.excerpt}</p>
                  <p className="mt-3 text-xs text-[var(--color-muted)]">
                    {heroPost.author?.name}{heroPost.publishedAt ? ` · ` : ''}
                    {heroPost.publishedAt ? (
                      <time dateTime={heroPost.publishedAt}>
                        {new Date(heroPost.publishedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    ) : null}
                    {' · '}
                    {heroPost.readingTimeMinutes} min de leitura
                  </p>
                </div>
              </Link>
            </article>
            <aside className="lg:col-span-2 space-y-6">
              <h2 className="serif text-2xl font-bold border-b pb-2">Em destaque</h2>
              {otherFeatured.length > 0
                ? otherFeatured.map((p) => (
                    <article key={p.id} className="flex gap-4">
                      <Link href={`/posts/${p.slug}` as any} className="shrink-0">
                        <div className="relative w-28 aspect-[4/3] rounded-md overflow-hidden bg-black/5">
                          <Image
                            src={p.coverImage.url}
                            alt={p.coverImage.alt}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="min-w-0">
                        {p.category ? (
                          <p className="text-xs uppercase tracking-wide text-[var(--color-accent)]">
                            {p.category.name}
                          </p>
                        ) : null}
                        <h3 className="serif font-semibold leading-snug">
                          <Link href={`/posts/${p.slug}` as any} className="hover:underline">
                            {p.title}
                          </Link>
                        </h3>
                      </div>
                    </article>
                  ))
                : (
                    <p className="text-sm text-[var(--color-muted)]">
                      Marque posts como “em destaque” no admin para preencher essa coluna.
                    </p>
                  )}
            </aside>
          </div>
        </section>
      ) : null}

      <section className="container mx-auto max-w-screen-xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="serif text-2xl font-bold">Mais recentes</h2>
          <Link href="/categorias" className="text-sm hover:underline">Ver todas as categorias →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {remaining.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      <section className="container mx-auto max-w-screen-xl px-4 py-10">
        <h2 className="serif text-2xl font-bold mb-6">Navegue por categoria</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}` as any}
              className="rounded-lg border bg-[var(--color-card)] p-5 hover:shadow-md transition-shadow"
            >
              <span
                className="inline-block h-2 w-8 rounded-full mb-3"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              <h3 className="serif font-semibold text-lg">{c.name}</h3>
              <p className="text-sm text-[var(--color-muted)] line-clamp-2 mt-1">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Newsletter" className="border-t bg-[var(--color-card)]">
        <div className="container mx-auto max-w-screen-xl px-4 py-12 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="serif text-2xl font-bold">Receba os melhores posts</h2>
            <p className="text-[var(--color-muted)] mt-2 max-w-md">
              Resumo semanal com curadoria. Sem spam, só conteúdo relevante.
            </p>
          </div>
          <form className="flex gap-2 max-w-md self-end" aria-label="Inscrição na newsletter">
            <label htmlFor="newsletter-email" className="sr-only">E-mail</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="seu@email.com"
              className="flex-1 h-10 rounded-md border bg-[var(--color-bg)] px-3 text-sm"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-medium hover:opacity-90"
            >
              Inscrever
            </button>
          </form>
        </div>
      </section>

      <section className="container mx-auto max-w-screen-xl px-4 py-12">
        <h2 className="serif text-2xl font-bold mb-3">Sobre o {channel.name}</h2>
        <p className="text-[var(--color-muted)] max-w-3xl">
          Veículo editorial dedicado ao nicho de {channel.niche}.{' '}
          <Link href="/sobre" className="underline">Saiba mais</Link>.
        </p>
      </section>
    </>
  );
}
