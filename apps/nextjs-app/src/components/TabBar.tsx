'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 'home', href: '/', label: 'Início' },
  { id: 'blog', href: '/blog', label: 'Ler' },
  { id: 'tools', href: '/calculadora', label: 'Ferramentas' },
  { id: 'shop', href: '/produtos', label: 'Produtos' },
];

export default function TabBar() {
  const path = usePathname();
  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    if (href === '/calculadora') return path === '/calculadora' || path === '/checklist';
    return path.startsWith(href);
  };

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      maxWidth: 480, margin: '0 auto',
      paddingBottom: 22, paddingTop: 10,
      background: 'linear-gradient(180deg, rgba(16,20,29,0) 0%, rgba(16,20,29,0.92) 35%, rgba(16,20,29,1) 100%)',
      backdropFilter: 'blur(16px)',
      borderTop: '0.5px solid var(--text-ghost)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {tabs.map(t => {
          const active = isActive(t.href);
          return (
            <Link key={t.id} href={t.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 14px',
              color: active ? 'var(--amber-glow)' : 'var(--text-faint)',
              fontSize: 10, fontWeight: 500, letterSpacing: 0.2,
            }}>
              <TabIcon id={t.id} active={active} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ id, active }: { id: string; active: boolean }) {
  const fill = active ? 'currentColor' : 'none';
  const op = active ? 0.18 : 1;
  if (id === 'home') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity={active ? 0.4 : 0.6}/>
      <path d="M12 3a9 9 0 0 0 0 18 7 7 0 0 1 0-18z" fill="currentColor"/>
    </svg>
  );
  if (id === 'blog') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5v15a1 1 0 0 0 1 1h6V5.5A1 1 0 0 0 10 4.5H4z" fill={fill} opacity={op}/>
      <path d="M20 4.5v15a1 1 0 0 1-1 1h-6V5.5a1 1 0 0 1 1-1H20z" fill={fill} opacity={op}/>
    </svg>
  );
  if (id === 'tools') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" fill={fill} opacity={op}/>
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 7v5l3.5 2"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1 12H6L5 8z" fill={fill} opacity={op}/>
      <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
    </svg>
  );
}
