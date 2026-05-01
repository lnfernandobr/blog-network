'use client';
import { useEffect, useState } from 'react';

export default function PostTOC({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const handler = () => {
      let curr = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) curr = s.id;
      }
      setActive(curr);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [sections]);

  return (
    <nav style={{
      margin: '32px 24px 0', padding: '18px 20px',
      background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
      borderRadius: 14,
    }}>
      <div className="kicker" style={{ marginBottom: 12 }}>Sumário</div>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sections.map((s, i) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                color: isActive ? 'var(--amber-glow)' : 'var(--text-dim)',
                fontSize: 14, fontFamily: 'var(--font-serif)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isActive ? 'var(--amber-glow)' : 'var(--text-faint)' }}>
                  0{i + 1}
                </span>
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
