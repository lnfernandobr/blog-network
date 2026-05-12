import type { Metadata } from 'next';
import TesteCliente from './TesteCliente';
import { abs, jsonLd } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Teste de Qualidade do Sono',
  description:
    'Avalie a qualidade do seu sono com 33 perguntas baseadas nas escalas PSQI, ESS e ISI. Resultado detalhado em menos de 5 minutos, sem cadastro.',
  alternates: {
    canonical: abs('/teste'),
  },
  openGraph: {
    title: 'Teste de Qualidade do Sono',
    description:
      'Avalie a qualidade do seu sono com escalas validadas internacionalmente. Gratuito, sem cadastro.',
    url: abs('/teste'),
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TestePage() {
  const ld = [
    breadcrumbLd([
      { name: 'Início', url: abs('/') },
      { name: 'Teste de Qualidade do Sono', url: abs('/teste') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Teste de Qualidade do Sono',
      description:
        'Avalie a qualidade do seu sono com 33 perguntas baseadas nas escalas PSQI, ESS e ISI.',
      url: abs('/teste'),
      applicationCategory: 'HealthApplication',
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      operatingSystem: 'Web',
    },
  ];

  return (
    <>
      {ld.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
        />
      ))}
      <TesteCliente />
    </>
  );
}
