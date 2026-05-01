import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-20 text-center">
      <p className="text-6xl serif font-bold">404</p>
      <h1 className="serif text-2xl font-bold mt-4">Página não encontrada</h1>
      <p className="text-[var(--color-muted)] mt-2 max-w-md mx-auto">
        A URL que você abriu não existe ou foi removida. Veja os
        <Link className="underline mx-1" href="/posts">posts mais recentes</Link>
        ou <Link className="underline ml-1" href="/">volte para a home</Link>.
      </p>
    </div>
  );
}
