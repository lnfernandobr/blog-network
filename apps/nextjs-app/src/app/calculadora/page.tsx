import type { Metadata } from 'next';
import { abs } from '@/lib/seo';
import CalcClient from './CalcClient';

export const metadata: Metadata = {
  title: 'Calculadora de ciclos do sono',
  description: 'Descubra a hora ideal de dormir (ou acordar) com base nos ciclos de 90 minutos do sono. Acorde entre ciclos, sem aquela sensação de exausto.',
  alternates: { canonical: abs('/calculadora') },
};

export default function CalcPage() {
  return <CalcClient />;
}
