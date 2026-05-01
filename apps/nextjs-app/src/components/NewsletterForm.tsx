'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(email);
  if (sent) return (
    <div style={{
      padding: '14px 18px', background: 'var(--amber-ember)',
      border: '0.5px solid rgba(232,182,106,0.35)', borderRadius: 12,
      color: 'var(--amber-glow)', fontSize: 14,
    }}>Pronto. Confirme no e-mail que acabamos de enviar 🌙</div>
  );
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="seu@email.com"
        style={{
          flex: 1, padding: '14px 16px',
          background: 'var(--ink-dusk)', border: '0.5px solid var(--text-ghost)',
          borderRadius: 99, color: 'var(--text-moon)',
          fontSize: 14, outline: 'none',
        }}
      />
      <button
        disabled={!valid}
        onClick={() => setSent(true)}
        style={{
          padding: '14px 18px',
          background: valid ? 'var(--amber-glow)' : 'var(--ink-fog)',
          color: valid ? 'var(--ink-void)' : 'var(--text-faint)',
          border: 0, borderRadius: 99, fontWeight: 600, fontSize: 14,
          cursor: valid ? 'pointer' : 'not-allowed',
        }}>Assinar</button>
    </div>
  );
}
