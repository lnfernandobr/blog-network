'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type Answers = Record<string, number>;

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface StepDef {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Scores {
  quality: number;
  sleepiness: number;
  insomnia: number;
  hygiene: number;
  overall: number;
}

/* ─── Question data ──────────────────────────────────────────────────────────── */

const FREQ = [
  'Nunca',
  'Menos de 1× por semana',
  '1–2× por semana',
  '3 ou mais vezes por semana',
];
const ESS = ['Nunca adormeço', 'Pequena chance', 'Chance moderada', 'Alta chance'];
const ISI_SEV = ['Nenhuma', 'Leve', 'Moderada', 'Severa', 'Muito severa'];
const NEVER_ALWAYS = ['Nunca', 'Raramente', 'Às vezes', 'Sempre'];

const STEPS: StepDef[] = [
  {
    id: 'perfil',
    title: 'Perfil de sono',
    description: 'Comece nos contando sobre seus horários e hábitos gerais de sono.',
    questions: [
      {
        id: 'bedtime',
        text: 'A que horas você costuma ir para a cama?',
        options: [
          'Antes das 21h',
          '21h – 22h',
          '22h – 23h',
          '23h – 00h',
          '00h – 01h',
          'Após a 01h',
        ],
      },
      {
        id: 'waketime',
        text: 'A que horas você costuma acordar?',
        options: [
          'Antes das 5h',
          '5h – 6h',
          '6h – 7h',
          '7h – 8h',
          '8h – 9h',
          'Após as 9h',
        ],
      },
      {
        id: 'timetosleep',
        text: 'Quanto tempo você leva para adormecer após se deitar?',
        options: [
          'Menos de 15 min',
          '15 – 30 min',
          '30 – 60 min',
          'Mais de 60 min',
        ],
      },
      {
        id: 'sleephours',
        text: 'Quantas horas você dorme por noite em média?',
        options: ['Menos de 5h', '5 – 6h', '6 – 7h', '7 – 8h', 'Mais de 8h'],
      },
    ],
  },
  {
    id: 'qualidade',
    title: 'Qualidade noturna',
    description:
      'No último mês, com que frequência você teve dificuldade para dormir pelos motivos abaixo?',
    questions: [
      { id: 'q_sleep30', text: 'Não conseguir adormecer em 30 minutos', options: FREQ },
      { id: 'q_wakenight', text: 'Acordar no meio da noite ou muito cedo', options: FREQ },
      { id: 'q_bathroom', text: 'Precisar levantar para ir ao banheiro', options: FREQ },
      { id: 'q_temp', text: 'Sentir muito calor ou muito frio', options: FREQ },
      { id: 'q_nightmares', text: 'Ter pesadelos ou sonhos perturbadores', options: FREQ },
      { id: 'q_pain', text: 'Sentir dor ou desconforto físico', options: FREQ },
      {
        id: 'q_overall',
        text: 'Como você avaliaria a qualidade geral do seu sono no último mês?',
        options: ['Muito boa', 'Boa', 'Ruim', 'Muito ruim'],
      },
    ],
  },
  {
    id: 'sonolencia',
    title: 'Sonolência diurna',
    description:
      'Qual a chance de você cochilar ou adormecer nas situações abaixo? (Escala de Sonolência de Epworth)',
    questions: [
      { id: 'ess1', text: 'Sentado lendo (livro, jornal, revista ou e-reader)', options: ESS },
      { id: 'ess2', text: 'Assistindo TV ou a um filme', options: ESS },
      {
        id: 'ess3',
        text: 'Sentado inativo em local público (sala de espera, teatro, reunião)',
        options: ESS,
      },
      {
        id: 'ess4',
        text: 'Como passageiro de carro em uma viagem de uma hora sem parar',
        options: ESS,
      },
      {
        id: 'ess5',
        text: 'Deitado para descansar à tarde quando as circunstâncias permitem',
        options: ESS,
      },
      { id: 'ess6', text: 'Sentado e conversando diretamente com alguém', options: ESS },
      {
        id: 'ess7',
        text: 'Sentado em silêncio após o almoço, sem consumo de álcool',
        options: ESS,
      },
      {
        id: 'ess8',
        text: 'Em um carro parado no trânsito por alguns minutos',
        options: ESS,
      },
    ],
  },
  {
    id: 'insomnia',
    title: 'Índice de insônia',
    description:
      'Avalie a gravidade de cada aspecto do seu sono no último mês. (Índice de Gravidade da Insônia — ISI)',
    questions: [
      { id: 'isi1', text: 'Dificuldade para adormecer', options: ISI_SEV },
      {
        id: 'isi2',
        text: 'Dificuldade para manter o sono durante a noite',
        options: ISI_SEV,
      },
      {
        id: 'isi3',
        text: 'Problema de acordar muito mais cedo do que desejado',
        options: ISI_SEV,
      },
      {
        id: 'isi4',
        text: 'Quão satisfeito(a) você está com seu padrão de sono atual?',
        options: [
          'Muito satisfeito',
          'Satisfeito',
          'Mais ou menos',
          'Insatisfeito',
          'Muito insatisfeito',
        ],
      },
      {
        id: 'isi5',
        text: 'Em que medida seu sono interfere no seu dia a dia? (concentração, produtividade, humor, energia)',
        options: ['Nada', 'Um pouco', 'Moderadamente', 'Muito', 'Extremamente'],
      },
      {
        id: 'isi6',
        text: 'Em que medida o comprometimento do sono é perceptível para outras pessoas na sua vida?',
        options: ['Nada', 'Um pouco', 'Moderadamente', 'Muito', 'Extremamente'],
      },
      {
        id: 'isi7',
        text: 'Quanto você está preocupado(a) com seu sono atualmente?',
        options: ['Nada', 'Um pouco', 'Moderadamente', 'Muito', 'Extremamente'],
      },
    ],
  },
  {
    id: 'higiene',
    title: 'Higiene do sono',
    description: 'Com que frequência você tem os seguintes hábitos?',
    questions: [
      {
        id: 'h_screens',
        text: 'Usa telas (celular, TV, computador) na última hora antes de dormir',
        options: NEVER_ALWAYS,
      },
      {
        id: 'h_caffeine',
        text: 'Consome cafeína (café, energético, chá preto ou verde) após as 14h',
        options: NEVER_ALWAYS,
      },
      {
        id: 'h_irregular',
        text: 'Dorme e acorda em horários muito diferentes nos fins de semana vs. dias úteis',
        options: NEVER_ALWAYS,
      },
      {
        id: 'h_exercise',
        text: 'Pratica pelo menos 30 min de atividade física moderada',
        options: NEVER_ALWAYS,
      },
      {
        id: 'h_naps',
        text: 'Tira cochilos longos (mais de 30 min) ou tardios (após as 15h)',
        options: NEVER_ALWAYS,
      },
      {
        id: 'h_stressed',
        text: 'Fica ruminando pensamentos ou ansioso quando vai dormir',
        options: NEVER_ALWAYS,
      },
      {
        id: 'h_darkroom',
        text: 'Mantém o quarto escuro, silencioso e em temperatura agradável para dormir',
        options: NEVER_ALWAYS,
      },
    ],
  },
];

/* ─── Scoring ────────────────────────────────────────────────────────────────── */

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

function calcScores(a: Answers): Scores {
  // Qualidade noturna (PSQI-inspired, max raw = 27)
  const tsRaw = ([0, 1, 2, 3] as const)[a.timetosleep ?? 0] ?? 0;
  const shRaw = ([3, 2, 1, 0, 0] as const)[a.sleephours ?? 3] ?? 0;
  const qualRaw =
    tsRaw +
    shRaw +
    (a.q_sleep30 ?? 0) +
    (a.q_wakenight ?? 0) +
    (a.q_bathroom ?? 0) +
    (a.q_temp ?? 0) +
    (a.q_nightmares ?? 0) +
    (a.q_pain ?? 0) +
    (a.q_overall ?? 0);
  const quality = clamp(Math.round((1 - qualRaw / 27) * 100));

  // Sonolência diurna (ESS, max raw = 24)
  const essRaw =
    (a.ess1 ?? 0) +
    (a.ess2 ?? 0) +
    (a.ess3 ?? 0) +
    (a.ess4 ?? 0) +
    (a.ess5 ?? 0) +
    (a.ess6 ?? 0) +
    (a.ess7 ?? 0) +
    (a.ess8 ?? 0);
  const sleepiness = clamp(Math.round((1 - essRaw / 24) * 100));

  // Índice de insônia (ISI, max raw = 28)
  const isiRaw =
    (a.isi1 ?? 0) +
    (a.isi2 ?? 0) +
    (a.isi3 ?? 0) +
    (a.isi4 ?? 0) +
    (a.isi5 ?? 0) +
    (a.isi6 ?? 0) +
    (a.isi7 ?? 0);
  const insomnia = clamp(Math.round((1 - isiRaw / 28) * 100));

  // Higiene do sono (max 21 pontos positivos)
  // Maus hábitos: pontuação positiva = 3 - resposta
  const badScore =
    (3 - (a.h_screens ?? 0)) +
    (3 - (a.h_caffeine ?? 0)) +
    (3 - (a.h_irregular ?? 0)) +
    (3 - (a.h_naps ?? 0)) +
    (3 - (a.h_stressed ?? 0));
  // Bons hábitos: pontuação positiva = resposta
  const goodScore = (a.h_exercise ?? 0) + (a.h_darkroom ?? 0);
  const hygiene = clamp(Math.round(((badScore + goodScore) / 21) * 100));

  const overall = clamp(
    Math.round(quality * 0.3 + insomnia * 0.3 + sleepiness * 0.2 + hygiene * 0.2),
  );

  return { quality, sleepiness, insomnia, hygiene, overall };
}

/* ─── Result interpretation ──────────────────────────────────────────────────── */

const BANDS = [
  {
    min: 80,
    label: 'Sono Excelente',
    desc: 'Seu sono está em ótimo estado. Continue com os hábitos que você mantém.',
  },
  {
    min: 65,
    label: 'Sono Bom',
    desc: 'Seu sono é saudável, com espaço para pequenas melhorias.',
  },
  {
    min: 50,
    label: 'Sono Regular',
    desc: 'Seu sono está funcional, mas comprometimentos relevantes estão presentes.',
  },
  {
    min: 35,
    label: 'Sono Comprometido',
    desc: 'Problemas de sono estão afetando sua qualidade de vida de forma significativa.',
  },
  {
    min: 0,
    label: 'Sono Muito Comprometido',
    desc: 'Seu sono precisa de atenção urgente. Considere consultar um especialista em medicina do sono.',
  },
];

function getBand(score: number): (typeof BANDS)[number] {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1]!;
}

function scoreColor(n: number): string {
  if (n >= 70) return 'var(--color-cool-sage)';
  if (n >= 45) return 'var(--color-amber-glow)';
  return 'var(--color-cool-rose)';
}

interface Rec {
  title: string;
  body: string;
}

function getRecs(s: Scores): Rec[] {
  const recs: Rec[] = [];

  if (s.insomnia < 50) {
    recs.push(
      s.insomnia < 35
        ? {
            title: 'Insônia significativa detectada',
            body: 'Seu perfil sugere insônia moderada a severa. A TCC-I (Terapia Cognitivo-Comportamental para Insônia) tem eficácia superior a medicamentos a longo prazo e é o tratamento de primeira linha recomendado pelas principais diretrizes clínicas. Procure um especialista em medicina do sono.',
          }
        : {
            title: 'Reduza a ativação pré-sono',
            body: 'Se você demora para adormecer ou acorda à noite, experimente a regra dos 20 minutos: se não dormiu em 20 min, levante e faça algo tranquilo sob luz baixa até sentir sono novamente. Evite ficar deitado acordado — isso cria associação negativa entre cama e vigília.',
          },
    );
  }

  if (s.hygiene < 60) {
    recs.push(
      s.hygiene < 35
        ? {
            title: 'Hábitos de sono críticos',
            body: 'Seus hábitos pré-sono estão prejudicando ativamente sua noite. Priorize três mudanças: (1) desligue telas 1h antes de dormir, (2) elimine cafeína após as 14h, (3) mantenha horários estáveis mesmo nos fins de semana — a consistência no horário de acordar é o fator mais importante para ancorar o ritmo circadiano.',
          }
        : {
            title: 'Ajuste a higiene do sono',
            body: 'Escolha uma mudança para implementar esta semana — por exemplo, um horário fixo de acordar sete dias por semana. Pequenas mudanças consistentes têm impacto cumulativo muito maior do que grandes reformas pontuais.',
          },
    );
  }

  if (s.sleepiness < 55) {
    recs.push({
      title: 'Sonolência diurna elevada',
      body: 'Sonolência excessiva sugere débito de sono ou sono não restaurador. Tente adicionar 30–60 min de sono por noite por uma semana e reavalie. Se persistir com hábitos adequados, considere investigar apneia obstrutiva do sono, especialmente se houver relatos de ronco ou acordar ofegante.',
    });
  }

  if (s.quality < 55) {
    recs.push({
      title: 'Qualidade noturna baixa',
      body: 'Acordar frequentemente ou ter sono superficial pode indicar ambiente inadequado, ansiedade noturna ou distúrbios como apneia. Certifique-se de que seu quarto está escuro, silencioso e entre 18–20°C — a temperatura do ambiente é um dos fatores mais subestimados na arquitetura do sono.',
    });
  }

  if (recs.length === 0) {
    recs.push({
      title: 'Mantenha a consistência',
      body: 'Seu sono está bem. O maior inimigo de um bom sono é a inconsistência. Manter horários estáveis mesmo nos fins de semana preserva o ritmo circadiano e sustenta a qualidade do sono ao longo do tempo.',
    });
  }

  if (recs.length < 2) {
    recs.push({
      title: 'Otimize o ambiente de sono',
      body: 'Para levar seu sono ao próximo nível: temperatura entre 18–20°C, escuridão total (use máscara se necessário) e controle de ruído. Esses três fatores têm suporte científico sólido na literatura de medicina do sono e são frequentemente negligenciados.',
    });
  }

  return recs.slice(0, 4);
}

/* ─── Sleep window helper ────────────────────────────────────────────────────── */

const BED_MID = [20.5, 21.5, 22.5, 23.5, 0.5, 1.5];
const WAKE_MID = [4.5, 5.5, 6.5, 7.5, 8.5, 9.5];

function sleepWindowHours(bedIdx: number, wakeIdx: number): number {
  let h = (WAKE_MID[wakeIdx] ?? 7) - (BED_MID[bedIdx] ?? 23);
  if (h < 0) h += 24;
  return Math.round(h * 10) / 10;
}

/* ─── UI atoms ───────────────────────────────────────────────────────────────── */

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3.5 transition-colors flex items-center gap-3 ${
        selected
          ? 'border-[var(--color-amber-glow)] bg-[var(--color-amber-ember)]'
          : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-amber-glow)]/50'
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          selected ? 'border-[var(--color-amber-glow)]' : 'border-[var(--color-border)]'
        }`}
      >
        {selected && (
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-amber-glow)] block" />
        )}
      </span>
      <span className="serif text-sm leading-snug">{label}</span>
    </button>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[var(--color-muted)]">{label}</span>
        <span className="font-mono text-sm font-semibold" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-ink-fog)]">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ─── Views ──────────────────────────────────────────────────────────────────── */

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center">
        <p className="kicker mb-5">Ferramenta gratuita</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-6">
          Teste de Qualidade do Sono
        </h1>
        <p className="serif text-lg text-[var(--color-muted)] leading-relaxed mb-10 max-w-lg mx-auto">
          33 perguntas baseadas em escalas validadas internacionalmente. Resultado com
          análise detalhada em menos de 5 minutos, sem cadastro.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-left">
          {[
            { sub: 'PSQI', label: 'Qualidade noturna' },
            { sub: 'ESS', label: 'Sonolência diurna' },
            { sub: 'ISI', label: 'Índice de insônia' },
            { sub: 'Hábitos', label: 'Higiene do sono' },
          ].map(({ sub, label }) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
            >
              <p className="font-mono text-xs text-[var(--color-amber-glow)] mb-1.5">{sub}</p>
              <p className="text-sm text-[var(--color-muted)] leading-snug">{label}</p>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="btn-primary text-base px-8">
          Iniciar teste →
        </button>

        <p className="text-xs text-[var(--color-text-faint)] mt-5">
          Sem cadastro · Sem dados salvos · Resultado imediato
        </p>
        <p className="text-xs text-[var(--color-text-faint)] mt-2 max-w-sm mx-auto leading-relaxed">
          Este teste é informativo e não substitui avaliação médica. Pontuações abaixo
          de 50 sugerem consulta com especialista em medicina do sono.
        </p>
      </div>
    </div>
  );
}

function TestView({
  step,
  stepIdx,
  totalSteps,
  answers,
  onAnswer,
  onNext,
  onBack,
}: {
  step: StepDef;
  stepIdx: number;
  totalSteps: number;
  answers: Answers;
  onAnswer: (id: string, v: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const answeredCount = step.questions.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answeredCount === step.questions.length;
  const progress = ((stepIdx + 1) / totalSteps) * 100;

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[var(--color-text-faint)]">
            Etapa {stepIdx + 1} de {totalSteps}
          </span>
          <span className="text-xs text-[var(--color-text-faint)]">
            {answeredCount}/{step.questions.length} respondidas
          </span>
        </div>
        <div className="h-1 rounded-full bg-[var(--color-ink-fog)]">
          <div
            className="h-1 rounded-full bg-[var(--color-amber-glow)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="kicker mb-2">{step.title}</p>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {step.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="serif text-base font-normal leading-snug mb-3">
              <span className="font-mono text-xs text-[var(--color-text-faint)] mr-2">
                {qi + 1}.
              </span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <OptionCard
                  key={oi}
                  label={opt}
                  selected={answers[q.id] === oi}
                  onClick={() => onAnswer(q.id, oi)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-10 pt-6 border-t border-[var(--color-border)]">
        <button onClick={onBack} className="btn-ghost text-sm">
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className={`btn-primary text-sm flex-1 ${!allAnswered ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {stepIdx < totalSteps - 1 ? 'Próximo →' : 'Ver resultado →'}
        </button>
      </div>

      {!allAnswered && (
        <p className="text-xs text-[var(--color-text-faint)] text-center mt-3">
          Responda todas as perguntas desta etapa para avançar
        </p>
      )}
    </div>
  );
}

function ResultView({
  scores,
  answers,
  onRestart,
}: {
  scores: Scores;
  answers: Answers;
  onRestart: () => void;
}) {
  const band = getBand(scores.overall);
  const recs = getRecs(scores);
  const color = scoreColor(scores.overall);
  const winHours =
    answers.bedtime !== undefined && answers.waketime !== undefined
      ? sleepWindowHours(answers.bedtime, answers.waketime)
      : null;

  const dimInterpretations = [
    {
      label: 'Qualidade noturna (PSQI)',
      score: scores.quality,
      bands: [
        { min: 70, text: 'Boa qualidade de sono — sem distúrbios significativos.' },
        {
          min: 45,
          text: 'Qualidade moderada — presença de despertares ou dificuldade de adormecer.',
        },
        { min: 0, text: 'Qualidade ruim — sono fragmentado ou muito superficial.' },
      ],
    },
    {
      label: 'Resistência à sonolência (ESS)',
      score: scores.sleepiness,
      bands: [
        { min: 70, text: 'Sonolência dentro do normal — sem impacto nas atividades diárias.' },
        {
          min: 45,
          text: 'Sonolência moderada — pode afetar concentração e humor ao longo do dia.',
        },
        {
          min: 0,
          text: 'Sonolência excessiva — investigar apneia obstrutiva ou débito de sono.',
        },
      ],
    },
    {
      label: 'Ausência de insônia (ISI)',
      score: scores.insomnia,
      bands: [
        { min: 70, text: 'Sem insônia clinicamente significativa.' },
        {
          min: 45,
          text: 'Insônia subclínica — sintomas presentes, mas ainda não em nível severo.',
        },
        { min: 0, text: 'Insônia clínica significativa — tratamento especializado recomendado.' },
      ],
    },
    {
      label: 'Higiene do sono',
      score: scores.hygiene,
      bands: [
        { min: 70, text: 'Hábitos adequados — boa base comportamental para sono saudável.' },
        {
          min: 45,
          text: 'Hábitos mistos — alguns comportamentos estão prejudicando o sono.',
        },
        {
          min: 0,
          text: 'Hábitos ruins — múltiplos fatores comportamentais sabotam o sono.',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Score header */}
      <div className="text-center mb-12">
        <p className="kicker mb-6">Resultado</p>

        {/* Circular gauge via conic-gradient */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${color} 0% ${scores.overall}%, var(--color-ink-fog) ${scores.overall}% 100%)`,
            }}
            role="img"
            aria-label={`Pontuação geral: ${scores.overall} de 100`}
          >
            <div className="w-[118px] h-[118px] rounded-full bg-[var(--color-ink-night)] flex flex-col items-center justify-center">
              <span className="serif text-4xl font-normal leading-none">{scores.overall}</span>
              <span className="text-xs text-[var(--color-text-faint)] mt-1">/ 100</span>
            </div>
          </div>
        </div>

        <h1
          className="serif text-3xl sm:text-4xl font-normal tracking-tight mb-3"
          style={{ color }}
        >
          {band.label}
        </h1>
        <p className="serif text-base text-[var(--color-muted)] leading-relaxed max-w-sm mx-auto">
          {band.desc}
        </p>

        {winHours !== null && (
          <p className="text-xs text-[var(--color-text-faint)] mt-4 max-w-xs mx-auto leading-relaxed">
            Janela de sono declarada: ~{winHours}h
            {winHours < 7
              ? ' — abaixo das 7–9h recomendadas para adultos.'
              : winHours > 9
                ? ' — acima de 9h pode indicar sono não restaurador.'
                : ' — dentro da faixa recomendada.'}
          </p>
        )}
      </div>

      {/* Sub-scores */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-6">
        <p className="kicker mb-5">Pontuação por dimensão</p>
        <div className="space-y-5">
          <ScoreBar label="Qualidade noturna" score={scores.quality} />
          <ScoreBar label="Resistência à sonolência diurna" score={scores.sleepiness} />
          <ScoreBar label="Ausência de insônia" score={scores.insomnia} />
          <ScoreBar label="Higiene do sono" score={scores.hygiene} />
        </div>
        <p className="text-xs text-[var(--color-text-faint)] mt-5 leading-relaxed">
          Pontuação de 0 a 100. Quanto maior, melhor. Baseado em PSQI, Escala de
          Sonolência de Epworth (ESS) e Índice de Gravidade da Insônia (ISI).
        </p>
      </section>

      {/* Clinical interpretation */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-6">
        <p className="kicker mb-5">Interpretação clínica</p>
        <div className="space-y-5">
          {dimInterpretations.map(({ label, score, bands }) => {
            const dimBand = bands.find((b) => score >= b.min) ?? bands[bands.length - 1]!;
            const c = scoreColor(score);
            return (
              <div key={label} className="flex gap-3 items-start">
                <span
                  className="w-2 h-2 rounded-full mt-[7px] flex-shrink-0"
                  style={{ backgroundColor: c }}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-moon)]">
                    {label}
                    <span
                      className="font-mono font-normal text-xs ml-2"
                      style={{ color: c }}
                    >
                      {score}
                    </span>
                  </p>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5 leading-relaxed">
                    {dimBand.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-6">
        <p className="kicker mb-4">Recomendações personalizadas</p>
        <div className="space-y-4">
          {recs.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6"
            >
              <p className="serif text-base font-normal text-[var(--color-text-moon)] mb-2">
                {r.title}
              </p>
              <p className="serif text-sm text-[var(--color-muted)] leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-[var(--color-amber-glow)]/20 bg-[var(--color-amber-ember)] p-6 sm:p-8 mb-8 text-center">
        <p className="serif text-base text-[var(--color-text-moon)] mb-4 leading-relaxed">
          Aprofunde seu entendimento sobre sono com nossos artigos.
        </p>
        <Link href="/blog" className="btn-primary text-sm">
          Ir para o blog →
        </Link>
      </section>

      {/* Disclaimer + restart */}
      <div className="text-center">
        <p className="text-xs text-[var(--color-text-faint)] leading-relaxed mb-6 max-w-sm mx-auto">
          Este teste é informativo e não substitui avaliação médica ou diagnóstico
          clínico. Pontuações abaixo de 50 sugerem consulta com especialista em
          medicina do sono.
        </p>
        <button onClick={onRestart} className="btn-ghost text-sm">
          Refazer o teste
        </button>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────────── */

export default function TesteCliente() {
  const [view, setView] = useState<'intro' | 'test' | 'result'>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [scores, setScores] = useState<Scores | null>(null);

  function handleAnswer(id: string, v: number) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  function handleNext() {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      setScores(calcScores(answers));
      setView('result');
    }
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1);
    } else {
      setView('intro');
    }
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRestart() {
    setView('intro');
    setStepIdx(0);
    setAnswers({});
    setScores(null);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (view === 'intro') return <IntroView onStart={() => setView('test')} />;
  if (view === 'result' && scores)
    return <ResultView scores={scores} answers={answers} onRestart={handleRestart} />;

  return (
    <TestView
      step={STEPS[stepIdx]!}
      stepIdx={stepIdx}
      totalSteps={STEPS.length}
      answers={answers}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}
