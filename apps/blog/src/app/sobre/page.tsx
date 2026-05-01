import type { Metadata } from 'next';
import { getChannel } from '@/lib/api';
import { InstitutionalPage } from '@/components/InstitutionalPage';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getChannel();
  return {
    title: 'Sobre',
    description: `Sobre o ${c.name}.`,
    alternates: { canonical: '/sobre' },
  };
}

export default async function AboutPage() {
  const c = await getChannel();
  return (
    <InstitutionalPage
      title="Sobre"
      fallback={`# Sobre o ${c.name}\n\nVeículo editorial dedicado ao nicho de ${c.niche}.`}
    />
  );
}
