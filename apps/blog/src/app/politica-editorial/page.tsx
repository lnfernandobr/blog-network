import type { Metadata } from 'next';
import { InstitutionalPage } from '@/components/InstitutionalPage';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Política Editorial',
  description: 'Como produzimos, revisamos e corrigimos o conteúdo.',
  alternates: { canonical: '/politica-editorial' },
};

export default function EditorialPage() {
  return (
    <InstitutionalPage
      title="Política Editorial"
      fallback={`# Política Editorial\n\n## Como produzimos\n\nNosso conteúdo passa por pesquisa, escrita e revisão antes de ir ao ar.\n\n## Correções\n\nErros factuais são corrigidos publicamente, com nota explicativa.\n\n## Conflitos de interesse\n\nQuando há parceria comercial, isso é declarado no início do artigo.`}
    />
  );
}
