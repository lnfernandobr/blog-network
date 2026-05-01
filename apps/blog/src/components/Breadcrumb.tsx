import Link from 'next/link';

export interface Crumb {
  href?: string;
  label: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-[var(--color-muted)]">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {c.href ? (
              <Link href={c.href as any} className="hover:underline">{c.label}</Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
            {i < items.length - 1 ? <span aria-hidden>›</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
