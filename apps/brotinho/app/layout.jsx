import Script from 'next/script';
import './globals.css';

const SITE_URL = 'https://brotinho.app';
const LAUNCH_DATE = '2026-06-12';
const LAUNCH_LABEL = '12 de junho de 2026';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'brotinho 🌱 App pra casal no Dia dos Namorados',
    template: '%s · brotinho',
  },
  description:
    'Pet-plantinha digital pra casal regar, conversar e ver crescer junto. 3 minutos por dia. Lança 12 de junho, Dia dos Namorados, no Android. Entre na lista de espera grátis e a gente avisa por WhatsApp.',
  applicationName: 'brotinho',
  authors: [{ name: 'brotinho', url: SITE_URL }],
  creator: 'brotinho',
  publisher: 'brotinho',
  category: 'lifestyle',
  keywords: [
    'brotinho',
    'app pra casal',
    'app de casal',
    'app dia dos namorados',
    'presente dia dos namorados',
    'pet virtual',
    'plantinha virtual',
    'tamagotchi de casal',
    'jogo de casal',
    'app de relacionamento',
    'cuidar de uma plantinha',
    'pet plantinha digital',
  ],
  formatDetection: { telephone: false, email: false, address: false },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
    languages: { 'pt-BR': '/', 'x-default': '/' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'brotinho',
    locale: 'pt_BR',
    title: 'brotinho · App pra casal cuidar de um broto juntos 🌱',
    description:
      'Pet-plantinha pro casal regar, conversar e ver crescer. 3 minutos por dia, juntos. Lança 12.06 no Dia dos Namorados.',
    url: SITE_URL + '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'brotinho: plantem algo juntos no Dia dos Namorados',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@brotinhogame',
    creator: '@brotinhogame',
    title: 'brotinho · App pra casal no Dia dos Namorados 🌱',
    description: 'Pet-plantinha pro casal cuidar junto. Lança 12.06.',
    images: ['/og-image.png'],
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION || undefined,
    other: BING_SITE_VERIFICATION
      ? { 'msvalidate.01': BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport = {
  themeColor: '#FFF1DA',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': SITE_URL + '/#organization',
  name: 'brotinho',
  url: SITE_URL + '/',
  logo: SITE_URL + '/icon-512.png',
  email: 'oi@brotinho.app',
  inLanguage: 'pt-BR',
  sameAs: ['https://instagram.com/brotinhogame'],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE_URL + '/#website',
  name: 'brotinho',
  url: SITE_URL + '/',
  description:
    'Pet-plantinha pra casal cuidar junto. Lança 12 de junho, Dia dos Namorados.',
  inLanguage: 'pt-BR',
  publisher: { '@id': SITE_URL + '/#organization' },
};

const applicationLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  '@id': SITE_URL + '/#app',
  name: 'brotinho',
  description:
    'Pet-plantinha digital pra casal regar, conversar e ver crescer junto. 3 minutos por dia, em 5 fases até florescer.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Android',
  url: SITE_URL + '/',
  inLanguage: 'pt-BR',
  datePublished: LAUNCH_DATE,
  image: SITE_URL + '/og-image.png',
  publisher: { '@id': SITE_URL + '/#organization' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/PreOrder',
    availabilityStarts: LAUNCH_DATE,
    url: SITE_URL + '/',
  },
};

const eventLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  '@id': SITE_URL + '/#launch',
  name: 'Lançamento do brotinho no Dia dos Namorados',
  description:
    'Lançamento do brotinho, app pra casal cuidar junto de um pet-plantinha digital.',
  startDate: LAUNCH_DATE,
  endDate: LAUNCH_DATE,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  location: {
    '@type': 'VirtualLocation',
    url: SITE_URL + '/',
  },
  organizer: { '@id': SITE_URL + '/#organization' },
  image: [SITE_URL + '/og-image.png'],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/PreOrder',
    url: SITE_URL + '/',
    validFrom: '2026-05-01',
  },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': SITE_URL + '/#faq',
  inLanguage: 'pt-BR',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O que é o brotinho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O brotinho é um pet-plantinha digital pra casal cuidar junto. Vocês entram no mesmo broto, um rega, o outro dá sol, conversam com ela por mensagem e veem ela crescer em 5 fases até florescer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quando o brotinho lança?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O lançamento é dia ' + LAUNCH_LABEL + ', Dia dos Namorados no Brasil. Primeiro pra Android e gratuito.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quanto custa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O brotinho é gratuito no lançamento. Sem assinatura, sem compra obrigatória.',
      },
    },
    {
      '@type': 'Question',
      name: 'Funciona em iPhone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No lançamento só Android. iOS chega logo depois. Entre na lista de espera e a gente avisa por WhatsApp quando liberar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso jogar com alguém?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, o brotinho é pra dois. Você convida seu par com um código bobinho tipo AMOR-247 e os dois entram no mesmo broto pra cuidar junto.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quanto tempo leva por dia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cerca de 3 minutos por dia, juntos. Um rega, o outro dá sol e os dois trocam recadinho com a plantinha.',
      },
    },
    {
      '@type': 'Question',
      name: 'É bom como presente de Dia dos Namorados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. O brotinho foi feito pro Dia dos Namorados: um broto que vocês plantam juntos no dia 12 de junho e cuidam por 6 meses até ele florescer. Funciona como presente afetivo, sem custo.',
      },
    },
  ],
};

const ldGraph = {
  '@context': 'https://schema.org',
  '@graph': [organizationLd, websiteLd, applicationLd, eventLd, faqLd],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldGraph) }}
        />
      </head>
      <body>
        <div className="desk-flair df-1">💕</div>
        <div className="desk-flair df-2">💗</div>
        <div className="desk-flair df-3">✿</div>
        <div className="desk-flair df-4">🌱</div>
        <div id="__next-root">{children}</div>

        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: true });
              `}
            </Script>
          </>
        ) : null}

        {META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
