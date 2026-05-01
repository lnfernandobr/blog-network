import Link from 'next/link';
import type { Metadata } from 'next';
import { PRODUCTS } from '@/lib/data';
import StripeImage from '@/components/StripeImage';
import { abs, jsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Produtos selecionados para dormir melhor',
  description: 'Curadoria de produtos testados pela equipe — máscaras, travesseiros, áudio, lâmpadas e chás. Sem promessas, só o que funcionou.',
  alternates: { canonical: abs('/produtos') },
};

const productsLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: PRODUCTS.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: p.name,
      description: p.why,
      offers: { '@type': 'Offer', priceCurrency: 'BRL', price: p.price },
    },
  })),
};

export default function ProdutosPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productsLd) }} />
      <header style={{ padding: '54px 24px 8px' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← início</Link>
      </header>
      <section style={{ padding: '24px 24px 8px' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>Selecionados pela equipe</div>
        <h1 className="serif-h1" style={{ fontSize: 34, marginBottom: 14 }}>Produtos que valem cada centavo.</h1>
        <p className="serif-body" style={{ margin: '0 0 28px', fontSize: 15 }}>
          Testamos pessoalmente. Quando indicamos, é porque comprariamos para nós mesmos.
        </p>
      </section>
      <ul style={{ listStyle: 'none', margin: 0, padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {PRODUCTS.map(p => (
          <li key={p.id} style={{
            background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
            borderRadius: 14, overflow: 'hidden',
          }}>
            <StripeImage height={120} label={p.id} tone={p.tone} radius={0}/>
            <div style={{ padding: '14px 14px 16px' }}>
              <span className="tag tag-amber" style={{ fontSize: 9, padding: '2px 7px' }}>{p.tag}</span>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.2, margin: '8px 0 6px' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.4, marginBottom: 10 }}>{p.why}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--amber-glow)' }}>{p.price}</div>
            </div>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 11, color: 'var(--text-faint)', padding: '24px 24px 8px', lineHeight: 1.5 }}>
        Alguns links são de afiliados. Indicamos só o que aprovamos. Isso ajuda a manter o conteúdo gratuito.
      </p>
    </main>
  );
}
