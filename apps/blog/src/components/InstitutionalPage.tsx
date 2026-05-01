import { renderMarkdown } from '@/lib/markdown';
import { Breadcrumb } from './Breadcrumb';

export function InstitutionalPage({
  title,
  markdown,
  fallback,
}: {
  title: string;
  markdown?: string;
  fallback: string;
}) {
  const html = renderMarkdown(markdown && markdown.trim().length > 0 ? markdown : fallback);
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-10">
      <Breadcrumb items={[{ href: '/', label: 'Início' }, { label: title }]} />
      <article className="mt-6 prose-editorial max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
