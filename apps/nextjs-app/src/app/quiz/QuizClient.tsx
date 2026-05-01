'use client';
import { useState } from 'react';
import Link from 'next/link';
import { QUIZ } from '@/lib/data';

export default function QuizClient() {
  const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = result
  const [answers, setAnswers] = useState<number[]>([]);
  const N = QUIZ.length;

  if (step === 0) return (
    <main style={{ padding: '54px 24px 0' }}>
      <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>← início</Link>
      <div style={{ marginTop: 60 }}>
        <div className="kicker" style={{ marginBottom: 14 }}>Quiz · 2 minutos</div>
        <h1 className="serif-h1" style={{ marginBottom: 18 }}>Qual a qualidade do seu sono, na real?</h1>
        <p className="serif-body" style={{ margin: '0 0 32px' }}>
          6 perguntas curtas. No final, você recebe um diagnóstico personalizado e um plano de 7 dias.
        </p>
        <button className="btn-primary" onClick={() => setStep(1)}>Começar →</button>
      </div>
    </main>
  );

  if (step > N) {
    const score = answers.reduce((a, b) => a + b, 0);
    const max = N * 3;
    const pct = Math.round(((max - score) / max) * 100);
    const verdict = pct >= 70 ? 'bom' : pct >= 40 ? 'comprometido' : 'crítico';
    const color = pct >= 70 ? 'var(--cool-sage)' : pct >= 40 ? 'var(--amber-glow)' : 'var(--cool-rose)';
    return (
      <main style={{ padding: '54px 24px 0' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>Diagnóstico</div>
        <h1 className="serif-h1" style={{ marginBottom: 24 }}>Seu sono está <em style={{ fontStyle: 'italic', color }}>{verdict}</em>.</h1>
        <div style={{
          background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
          borderRadius: 16, padding: '24px', marginBottom: 24,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>ÍNDICE</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 56, color, lineHeight: 1 }}>{pct}<span style={{ fontSize: 24, color: 'var(--text-faint)' }}>/100</span></div>
          <div style={{ height: 4, background: 'var(--ink-fog)', borderRadius: 2, marginTop: 18, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 1s' }}/>
          </div>
        </div>
        <p className="serif-body" style={{ marginBottom: 24 }}>
          Suas respostas indicam pontos críticos em <strong>cafeína tardia</strong> e <strong>uso de telas</strong>. Comece pelo plano de 7 dias.
        </p>
        <Link className="btn-primary" href="/checklist">Ver plano de 7 dias →</Link>
      </main>
    );
  }

  const i = step - 1;
  const q = QUIZ[i];
  if (!q) return null;
  const progress = ((step - 1) / N) * 100;

  return (
    <main style={{ padding: '54px 24px 0' }}>
      <button onClick={() => setStep(step - 1)} style={{ background: 'transparent', border: 0, color: 'var(--text-dim)', fontSize: 13, padding: 0 }}>
        ← voltar
      </button>
      <div style={{ height: 3, background: 'var(--ink-fog)', borderRadius: 2, margin: '24px 0', overflow: 'hidden' }}>
        <div style={{ width: `${progress + 100/N}%`, height: '100%', background: 'var(--amber-glow)', transition: 'width 0.4s' }}/>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)', marginBottom: 18 }}>
        {String(step).padStart(2,'0')} / {String(N).padStart(2,'0')}
      </div>
      <h2 className="serif-h2" style={{ fontSize: 26, marginBottom: 28 }}>{q.q}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, j) => (
          <button key={j} onClick={() => {
            const next = [...answers]; next[i] = j; setAnswers(next); setStep(step + 1);
          }} style={{
            textAlign: 'left', padding: '18px 20px',
            background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
            borderRadius: 14, color: 'var(--text-moon)', fontSize: 15,
            fontFamily: 'var(--font-serif)',
          }}>{opt}</button>
        ))}
      </div>
    </main>
  );
}
