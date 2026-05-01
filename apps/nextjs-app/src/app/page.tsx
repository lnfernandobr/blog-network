import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import Moon from '@/components/Moon';
import StripeImage from '@/components/StripeImage';
import NewsletterForm from '@/components/NewsletterForm';
import { getChannel, listCategories, listPosts } from '@/lib/api';
import { adaptCategory, adaptPost } from '@/lib/adapt';
import { abs, jsonLd } from '@/lib/seo';
import {
  breadcrumbLd,
  collectionPageLd,
  organizationLd,
  websiteLd,
} from '@/lib/jsonld';

export const revalidate = 300;

export default async function HomePage() {
  const [channel, featured, recent, cats] = await Promise.all([
    getChannel(),
    listPosts({ featured: true, limit: 1 }),
    listPosts({ limit: 6 }),
    listCategories(),
  ]);

  const heroSrc = featured.items[0] ?? recent.items[0];
  const heroPost = heroSrc ? adaptPost(heroSrc) : null;
  const recentPosts = recent.items
    .filter((p) => !heroSrc || p.id !== heroSrc.id)
    .slice(0, 5)
    .map(adaptPost);
  const uiCats = cats.slice(0, 4).map(adaptCategory);

  const ld = [
    organizationLd(channel),
    websiteLd(channel),
    breadcrumbLd([{ name: 'Início', url: abs('/') }]),
    collectionPageLd({
      name: channel.name,
      description: 'Conteúdo, ferramentas e produtos para você dormir melhor.',
      url: abs('/'),
      posts: recent.items.slice(0, 10),
    }),
  ];

  return (
    <main>
      {ld.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
        />
      ))}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '54px 24px 8px' }}>
        <Logo size={16} />
        <Link href="/sobre" style={{ color: 'var(--text-dim)', fontSize: 13 }}>sobre</Link>
      </header>

      {/* HERO */}
      <section style={{ padding: '32px 24px 28px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, right: -30, opacity: 0.5, pointerEvents: 'none' }}>
          <Moon size={140} phase={0.55} />
        </div>
        <div className="kicker" style={{ marginBottom: 14 }}>Há 3 horas você devia estar dormindo</div>
        <h1 className="serif-h1" style={{ marginBottom: 20 }}>
          Dormir mal não é<br />
          <em style={{ fontStyle: 'italic', color: 'var(--amber-glow)' }}>destino.</em><br />
          É um problema com<br />solução.
        </h1>
        <p className="serif-body" style={{ margin: '0 0 24px', maxWidth: 320 }}>
          Conteúdo baseado em ciência, ferramentas práticas e produtos testados — para você voltar a ter noites de verdade.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn-primary" href="/quiz">Diagnóstico do meu sono →</Link>
          <Link className="btn-ghost" href="/blog">Ler artigos</Link>
        </div>
      </section>

      {/* QUIZ CARD */}
      <section style={{ padding: '0 24px 28px' }}>
        <Link href="/quiz" style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'linear-gradient(135deg, var(--ink-dusk) 0%, var(--ink-fog) 100%)',
          border: '0.5px solid var(--text-ghost)', borderRadius: 18, padding: '20px 22px',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24, flexShrink: 0,
            background: 'var(--amber-ember)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber-glow)" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--amber-glow)', marginBottom: 4 }}>Quiz · 2 min</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.2, marginBottom: 2 }}>Qual a qualidade do seu sono?</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Resultado personalizado + plano</div>
          </div>
          <span style={{ color: 'var(--text-faint)' }}>→</span>
        </Link>
      </section>

      {/* FEATURED */}
      {heroPost && (
        <section style={{ padding: '0 24px 28px' }}>
          <div className="kicker" style={{ marginBottom: 12 }}>Em destaque</div>
          <Link href={`/blog/${heroPost.slug}`}>
            {heroPost.coverUrl ? (
              <div style={{ position: 'relative', width: '100%', height: 210, borderRadius: 14, overflow: 'hidden' }}>
                <Image
                  src={heroPost.coverUrl}
                  alt={heroPost.coverAlt ?? heroPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            ) : (
              <StripeImage height={210} label={heroPost.id} tone={heroPost.tone} />
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
              <span className={`tag tag-${heroPost.catTone}`}>{heroPost.catLabel}</span>
              <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>· {heroPost.minutes} min de leitura</span>
            </div>
            <h2 className="serif-h2" style={{ marginBottom: 10 }}>{heroPost.title}</h2>
            <p className="serif-body" style={{ margin: 0, fontSize: 15 }}>{heroPost.excerpt}</p>
          </Link>
        </section>
      )}

      {/* CATEGORIES */}
      {uiCats.length > 0 && (
        <section style={{ padding: '12px 24px 28px' }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Por onde começar</div>
          <h2 className="serif-h2" style={{ marginBottom: 18 }}>Categorias</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {uiCats.map((c) => (
              <Link
                key={c.id}
                href={`/blog?cat=${c.slug}`}
                style={{
                  background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
                  borderRadius: 14, padding: '16px 16px',
                  display: 'flex', flexDirection: 'column', gap: 14, minHeight: 110,
                }}
              >
                <div className={`cat-bullet cat-bullet-${c.catTone}`}>◐</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 2 }}>{c.name}</div>
                  {c.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.4 }}>{c.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TOOLS */}
      <section style={{ padding: '12px 24px 28px' }}>
        <div className="kicker" style={{ marginBottom: 8 }}>Ferramentas</div>
        <h2 className="serif-h2" style={{ marginBottom: 18 }}>Para usar agora</h2>
        <Link href="/calculadora" style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
          borderRadius: 14, padding: '18px 20px', marginBottom: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 4 }}>Calculadora de ciclos</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>A que horas dormir pra acordar descansado</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--amber-glow)' }}>22:30</div>
        </Link>
        <Link href="/checklist" style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
          borderRadius: 14, padding: '18px 20px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 4 }}>Checklist de higiene do sono</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>14 hábitos validados pela ciência</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-faint)' }}>14 itens</div>
        </Link>
      </section>

      {/* RECENT */}
      {recentPosts.length > 0 && (
        <section style={{ padding: '12px 24px 28px' }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Recentes</div>
          <h2 className="serif-h2" style={{ marginBottom: 18 }}>Últimos artigos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {recentPosts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                style={{
                  display: 'grid', gridTemplateColumns: '88px 1fr', gap: 14, alignItems: 'center',
                  borderBottom: '0.5px solid var(--text-ghost)', paddingBottom: 16,
                }}
              >
                <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 10, overflow: 'hidden' }}>
                  {p.coverUrl ? (
                    <Image
                      src={p.coverUrl}
                      alt={p.coverAlt ?? p.title}
                      fill
                      sizes="88px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <StripeImage height={88} label={p.id} tone={p.tone} />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span className={`tag tag-${p.catTone}`}>{p.catLabel}</span>
                    <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>· {p.minutes} min</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.25 }}>{p.title}</div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <Link className="btn-ghost" href="/blog">Ver todos os artigos →</Link>
          </div>
        </section>
      )}

      {/* AUTHORITY */}
      <section style={{ padding: '32px 24px', borderTop: '0.5px solid var(--text-ghost)', borderBottom: '0.5px solid var(--text-ghost)' }}>
        <div className="kicker" style={{ marginBottom: 12 }}>Por que confiar</div>
        <p className="serif-body" style={{ color: 'var(--text-moon)', margin: '0 0 22px' }}>
          Todo conteúdo é revisado por profissionais da medicina do sono e referenciado a estudos peer-reviewed. Sem promessas vazias.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            [String(recent.total || recentPosts.length), 'artigos publicados'],
            ['380+', 'fontes científicas'],
            ['4', 'especialistas revisores'],
          ].map(([n, l], i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--amber-glow)', lineHeight: 1, marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.3 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <NewsletterCTA />

      <footer style={{ padding: '32px 24px 16px', borderTop: '0.5px solid var(--text-ghost)', marginTop: 24 }}>
        <Logo size={14} />
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 14, lineHeight: 1.6 }}>
          <div><Link href="/sobre">Sobre</Link> · Metodologia · Contato</div>
          <div>Privacidade · Termos · Imprensa</div>
          <div style={{ marginTop: 14 }}>© {new Date().getFullYear()} {channel.name}</div>
        </div>
      </footer>
    </main>
  );
}

function NewsletterCTA() {
  return (
    <section style={{ padding: '40px 24px 8px' }}>
      <div className="kicker" style={{ marginBottom: 12 }}>Newsletter</div>
      <h2 className="serif-h2" style={{ marginBottom: 10 }}>Uma carta toda quinta. Sem spam.</h2>
      <p className="serif-body" style={{ fontSize: 14, margin: '0 0 18px' }}>
        O melhor da semana sobre sono, num e-mail curto que cabe entre o chá e o livro de cabeceira.
      </p>
      <NewsletterForm />
    </section>
  );
}
