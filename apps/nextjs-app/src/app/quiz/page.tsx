import type { Metadata } from 'next';
import { abs, jsonLd } from '@/lib/seo';
import { QUIZ } from '@/lib/data';
import QuizClient from './QuizClient';

export const metadata: Metadata = {
  title: 'Quiz do sono — diagnóstico em 2 minutos',
  description: 'Responda 6 perguntas e receba um diagnóstico personalizado da qualidade do seu sono, com plano de 7 dias.',
  alternates: { canonical: abs('/quiz') },
};

const quizLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Quiz do sono',
  about: 'Avaliação rápida da qualidade do sono',
  educationalLevel: 'Beginner',
  hasPart: QUIZ.map((q) => ({
    '@type': 'Question',
    name: q.q,
    suggestedAnswer: q.options.map((o) => ({ '@type': 'Answer', text: o })),
  })),
};

export default function QuizPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(quizLd) }} />
      <QuizClient />
    </>
  );
}
