import type { Metadata } from 'next';
import { InstitutionalPage } from '@/components/InstitutionalPage';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacyPage() {
  return (
    <InstitutionalPage
      title="Política de Privacidade"
      fallback={`# Política de Privacidade\n\nNão coletamos dados pessoais identificáveis sem consentimento expresso.`}
    />
  );
}
