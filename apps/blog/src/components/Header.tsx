import Link from 'next/link';
import type { CategoryDto, ChannelDto } from '@bn/shared';
import { ThemeToggle } from './ThemeToggle';
import { SearchForm } from './SearchForm';

export function Header({ channel, categories }: { channel: ChannelDto; categories: CategoryDto[] }) {
  return (
    <header className="border-b bg-[var(--color-card)] sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-card)]/90">
      <a href="#main" className="skip-link">Pular para o conteúdo</a>
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label={channel.name}>
            <span className="text-xl serif font-bold tracking-tight">{channel.name}</span>
          </Link>
          <nav aria-label="Principal" className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:underline">Início</Link>
            <Link href="/categorias" className="hover:underline">Categorias</Link>
            <Link href="/autores" className="hover:underline">Autores</Link>
            <Link href="/sobre" className="hover:underline">Sobre</Link>
          </nav>
          <div className="flex items-center gap-2">
            <SearchForm />
            <ThemeToggle />
          </div>
        </div>
        {categories.length > 0 ? (
          <nav aria-label="Categorias" className="hidden md:flex items-center gap-4 py-2 -mt-1 text-sm overflow-x-auto">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}` as any}
                className="text-[var(--color-muted)] hover:text-[var(--color-fg)] whitespace-nowrap"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
