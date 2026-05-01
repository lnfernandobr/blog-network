import type { Metadata } from 'next';
import { Newsreader, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import TabBar from '@/components/TabBar';
import { getChannel } from '@/lib/api';
import { buildBaseMetadata } from '@/lib/seo';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const channel = await getChannel();
  return buildBaseMetadata(channel);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const channel = await getChannel();
  return (
    <html lang={channel.language || 'pt-BR'} className={`${newsreader.variable} ${interTight.variable} ${jetbrains.variable}`}>
      <body>
        <div className="app-shell">
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}
