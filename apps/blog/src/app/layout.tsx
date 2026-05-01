import type { Metadata } from 'next';
import { getChannel, listCategories } from '@/lib/api';
import { buildBaseMetadata } from '@/lib/seo';
import { jsonLd } from '@/lib/seo';
import { organizationLd, websiteLd } from '@/lib/jsonld';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const channel = await getChannel();
    return buildBaseMetadata(channel);
  } catch {
    return { title: 'Blog' };
  }
}

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('bn_blog_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`.trim();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [channel, categories] = await Promise.all([getChannel(), listCategories()]);
  return (
    <html lang={channel.language || 'pt-BR'} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="application/rss+xml" title={`${channel.name} · RSS`} href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title={`${channel.name} · Atom`} href="/atom.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd(channel)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd(channel)) }}
        />
      </head>
      <body>
        <Header channel={channel} categories={categories} />
        <main id="main">{children}</main>
        <Footer channel={channel} />
      </body>
    </html>
  );
}
