import type { Metadata } from 'next';
import { abs } from '@/lib/seo';
import ChecklistClient from './ChecklistClient';

export const metadata: Metadata = {
  title: 'Checklist de higiene do sono — 14 hábitos validados',
  description: 'Os 14 hábitos validados pela ciência do sono, organizados em três blocos: antes de deitar, no quarto e na rotina diária.',
  alternates: { canonical: abs('/checklist') },
};

export default function ChecklistPage() {
  return <ChecklistClient />;
}
