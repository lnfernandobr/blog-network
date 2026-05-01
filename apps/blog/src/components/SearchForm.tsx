'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchForm() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/buscar?q=${encodeURIComponent(q.trim())}` as any);
      }}
      className="hidden sm:flex"
    >
      <label className="sr-only" htmlFor="site-search">Buscar no blog</label>
      <input
        id="site-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        className="h-9 w-44 rounded-md border bg-[var(--color-card)] px-3 text-sm focus:outline-none focus:ring-2"
      />
    </form>
  );
}
