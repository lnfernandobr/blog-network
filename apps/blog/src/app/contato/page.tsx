import type { Metadata } from 'next';
import { InstitutionalPage } from '@/components/InstitutionalPage';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Como entrar em contato.',
  alternates: { canonical: '/contato' },
};

export default function ContactPage() {
  return (
    <InstitutionalPage
      title="Contato"
      fallback={`# Contato\n\nEntre em contato pelo canal indicado no rodapé do site.`}
    />
  );
}
