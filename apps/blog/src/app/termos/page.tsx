import type { Metadata } from 'next';
import { InstitutionalPage } from '@/components/InstitutionalPage';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Termos de Uso',
  alternates: { canonical: '/termos' },
};

export default function TermsPage() {
  return (
    <InstitutionalPage
      title="Termos de Uso"
      fallback={`# Termos de Uso\n\nO conteúdo é de uso gratuito para leitura. Reprodução requer citação e link.`}
    />
  );
}
