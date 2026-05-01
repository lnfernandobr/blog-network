'use client';
import { useState } from 'react';
import Link from 'next/link';

const ITEMS = [
  { g: 'Antes de deitar', items: [
    'Diminuí luzes 90 min antes',
    'Sem cafeína depois das 14h',
    'Janta leve 3h antes',
    'Tela longe da cama',
  ]},
  { g: 'No quarto', items: [
    'Quarto entre 16–19°C',
    'Escuridão total ou máscara',
    'Silêncio ou ruído marrom',
    'Lençol limpo, fresco',
  ]},
  { g: 'Hábitos', items: [
    'Mesmo horário todo dia',
    'Sol nos olhos pela manhã',
    'Exercício antes das 18h',
    'Sem álcool antes de dormir',
    'Journaling se a mente acelerar',
    'Respiração 4-7-8 se 20 min sem sono',
  ]},
];

export default function ChecklistClient() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const total = ITEMS.reduce((a, g) => a + g.items.length, 0);
  const checked = Object.values(done).filter(Boolean).length;
  return (
    <main>
      <header style={{ padding: '54px 24px 8px' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← início</Link>
      </header>
      <section style={{ padding: '24px 24px 0' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>Plano de 7 dias</div>
        <h1 className="serif-h1" style={{ fontSize: 34, marginBottom: 14 }}>Checklist de higiene do sono</h1>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--amber-glow)' }}>{checked}</span>
          <span style={{ color: 'var(--text-faint)' }}>/ {total} hábitos</span>
        </div>
        {ITEMS.map(g => (
          <div key={g.g} style={{ marginBottom: 28 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>{g.g}</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map(it => {
                const on = !!done[it];
                return (
                  <li key={it}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', cursor: 'pointer',
                      background: on ? 'var(--amber-ember)' : 'var(--ink-dusk)',
                      border: '0.5px solid ' + (on ? 'rgba(232,182,106,0.3)' : 'var(--text-ghost)'),
                      borderRadius: 12,
                      color: on ? 'var(--amber-glow)' : 'var(--text-moon)',
                      fontFamily: 'var(--font-serif)', fontSize: 15,
                    }}>
                      <input type="checkbox" checked={on} onChange={() => setDone(d => ({ ...d, [it]: !d[it] }))} style={{ display: 'none' }}/>
                      <span style={{
                        width: 20, height: 20, borderRadius: 10,
                        border: '1.5px solid ' + (on ? 'var(--amber-glow)' : 'var(--text-faint)'),
                        background: on ? 'var(--amber-glow)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-void)" strokeWidth="3.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>}
                      </span>
                      {it}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
