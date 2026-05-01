'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

function addMinutes(time: string, mins: number) {
  const [hStr = '0', mStr = '0'] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const total = (h * 60 + m + mins + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}

export default function CalcClient() {
  const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
  const [time, setTime] = useState('06:30');

  const cycles = useMemo(() => {
    const FALL = 14; // min p/ adormecer
    const arr: { cycles: number; time: string; hours: number }[] = [];
    for (let n = 6; n >= 3; n--) {
      const delta = n * 90;
      const t = mode === 'wake' ? addMinutes(time, -(delta + FALL)) : addMinutes(time, delta + FALL);
      arr.push({ cycles: n, time: t, hours: n * 1.5 });
    }
    return arr;
  }, [time, mode]);

  return (
    <main>
      <header style={{ padding: '54px 24px 8px' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← início</Link>
      </header>
      <section style={{ padding: '24px 24px 0' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>Ferramenta</div>
        <h1 className="serif-h1" style={{ fontSize: 34, marginBottom: 14 }}>Calculadora de ciclos</h1>
        <p className="serif-body" style={{ margin: '0 0 28px', fontSize: 15 }}>
          O sono se organiza em ciclos de 90 min. Acordar entre ciclos = sensação de descanso.
        </p>

        <div style={{ display: 'flex', gap: 6, background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)', padding: 4, borderRadius: 12, marginBottom: 22 }}>
          {[['wake','Quero acordar às'],['sleep','Vou dormir às']].map(([id,lbl]) => (
            <button key={id} onClick={() => setMode(id as 'wake'|'sleep')} style={{
              flex: 1, padding: '10px',
              background: mode === id ? 'var(--ink-fog)' : 'transparent',
              color: mode === id ? 'var(--text-moon)' : 'var(--text-dim)',
              border: 0, borderRadius: 8, fontSize: 12, fontWeight: 500,
            }}>{lbl}</button>
          ))}
        </div>

        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{
          width: '100%', padding: '20px',
          background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
          borderRadius: 14, color: 'var(--amber-glow)',
          fontFamily: 'var(--font-mono)', fontSize: 28, textAlign: 'center', outline: 'none',
        }}/>

        <div style={{ marginTop: 22 }}>
          <div className="kicker" style={{ marginBottom: 14 }}>{mode === 'wake' ? 'Vá dormir às' : 'Acorde às'}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cycles.map(c => {
              const ideal = c.cycles === 5 || c.cycles === 6;
              return (
                <li key={c.cycles} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px',
                  background: ideal ? 'var(--amber-ember)' : 'var(--ink-dusk)',
                  border: '0.5px solid ' + (ideal ? 'rgba(232,182,106,0.3)' : 'var(--text-ghost)'),
                  borderRadius: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: ideal ? 'var(--amber-glow)' : 'var(--text-moon)' }}>{c.time}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{c.cycles} ciclos · {c.hours}h de sono</div>
                  </div>
                  {ideal && <span className="tag tag-amber">Ideal</span>}
                </li>
              );
            })}
          </ul>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 14, lineHeight: 1.5 }}>
            * Considera 14 minutos médios para adormecer. Ajuste conforme seu padrão.
          </p>
        </div>
      </section>
    </main>
  );
}
