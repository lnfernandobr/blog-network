import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import { abs } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Quem somos, como produzimos conteúdo e por que confiar em nós.',
  alternates: { canonical: abs('/sobre') },
};

export default function SobrePage() {
  return (
    <main>
      <header style={{ padding: '54px 24px 8px' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← início</Link>
      </header>
      <section style={{ padding: '24px 24px 0' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>Sobre</div>
        <h1 className="serif-h1" style={{ marginBottom: 18 }}>Acreditamos que <em style={{ fontStyle: 'italic', color: 'var(--amber-glow)' }}>dormir bem</em> é a base de tudo.</h1>
        <p className="serif-body" style={{ marginBottom: 14 }}>
          Sonoprofundo nasceu de uma frustração: tanta informação ruim sobre sono na internet — e tão pouco que realmente funciona.
        </p>
        <p className="serif-body" style={{ marginBottom: 24 }}>
          Nossa missão é simples: traduzir a melhor ciência do sono em conteúdo claro, ferramentas práticas e produtos honestos.
        </p>

        <div className="kicker" style={{ margin: '36px 0 12px' }}>Equipe</div>
        {[
          { n: 'Dra. Helena Sato', r: 'Médica do sono · CRM 142.388', b: '15 anos em distúrbios do sono. Mestre pela USP.' },
          { n: 'Dr. Rafael Lima', r: 'Neurocientista', b: 'PhD em ritmos circadianos pela UFRGS.' },
          { n: 'Marina Costa', r: 'Editora-chefe', b: 'Jornalista de saúde há 12 anos.' },
        ].map(p => (
          <div key={p.n} style={{ display: 'flex', gap: 14, marginBottom: 16, padding: '16px', background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)', borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--ink-fog)', flexShrink: 0 }}/>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{p.n}</div>
              <div style={{ fontSize: 11, color: 'var(--amber-glow)', marginTop: 2 }}>{p.r}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.4 }}>{p.b}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 32, padding: '20px', background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)', borderRadius: 14 }}>
          <Logo size={14}/>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
            Não vendemos seus dados. Não fazemos sensacionalismo. Quando erramos, corrigimos publicamente.
          </p>
        </div>
      </section>
    </main>
  );
}
