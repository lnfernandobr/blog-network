import Link from 'next/link';
import type { ChannelDto } from '@bn/shared';

export function Footer({ channel }: { channel: ChannelDto }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t mt-16 bg-[var(--color-card)]">
      <div className="container mx-auto max-w-screen-xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <p className="serif text-lg font-bold mb-2">{channel.name}</p>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Conteúdo editorial sobre {channel.niche}.
          </p>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Conteúdo</h2>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            <li><Link href="/" className="hover:text-[var(--color-fg)]">Todos os posts</Link></li>
            <li><Link href="/categorias" className="hover:text-[var(--color-fg)]">Categorias</Link></li>
            <li><Link href="/autores" className="hover:text-[var(--color-fg)]">Autores</Link></li>
            <li><Link href="/buscar" className="hover:text-[var(--color-fg)]">Buscar</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Institucional</h2>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            <li><Link href="/sobre" className="hover:text-[var(--color-fg)]">Sobre</Link></li>
            <li><Link href="/politica-editorial" className="hover:text-[var(--color-fg)]">Política editorial</Link></li>
            <li><Link href="/contato" className="hover:text-[var(--color-fg)]">Contato</Link></li>
            <li><Link href="/privacidade" className="hover:text-[var(--color-fg)]">Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-[var(--color-fg)]">Termos</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Feeds</h2>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            <li><a href="/feed.xml" className="hover:text-[var(--color-fg)]">RSS</a></li>
            <li><a href="/atom.xml" className="hover:text-[var(--color-fg)]">Atom</a></li>
            <li><a href="/sitemap.xml" className="hover:text-[var(--color-fg)]">Sitemap</a></li>
            <li><a href="/llms.txt" className="hover:text-[var(--color-fg)]">llms.txt</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-xs text-[var(--color-muted)] text-center">
        © {year} {channel.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
