/**
 * Dados estáticos do site — produtos curados e quiz.
 *
 * Os POSTS antigos foram removidos: agora vêm da API central via lib/api.ts.
 * Produtos e quiz continuam estáticos por enquanto (não são geridos por IA).
 */

export const PRODUCTS = [
  { id: 'p1', name: 'Máscara de seda Mulberry', price: 'R$ 89', tag: 'Mais vendido', tone: 'amber' as const, why: 'Bloqueio total de luz sem pressão nos olhos.' },
  { id: 'p2', name: 'Ruído marrom — 8h', price: 'Grátis', tag: 'Áudio', tone: 'cool' as const, why: 'Frequência mais grave que o branco. Mascara melhor.' },
  { id: 'p3', name: 'Travesseiro cervical Tempur', price: 'R$ 449', tag: 'Recomendado', tone: 'plum' as const, why: 'Memória viscoelástica + altura ajustável.' },
  { id: 'p4', name: 'Lâmpada âmbar 1800K', price: 'R$ 79', tag: 'Sob medida', tone: 'amber' as const, why: 'Não suprime melatonina como a luz branca.' },
  { id: 'p5', name: 'Chá de camomila + valeriana', price: 'R$ 38', tag: 'Indicação', tone: 'sage' as const, why: 'Combinação clássica. Sem efeito rebote.' },
  { id: 'p6', name: 'Diário de sono — 90 dias', price: 'R$ 64', tag: 'Da casa', tone: 'cool' as const, why: 'Páginas guiadas para mapear seu padrão.' },
];

export const QUIZ = [
  { q: 'Quanto tempo você demora pra dormir, em média?', options: ['Menos de 15 min', '15 a 30 min', '30 min a 1 hora', 'Mais de 1 hora'] },
  { q: 'Você acorda no meio da noite com frequência?', options: ['Quase nunca', '1–2 vezes por semana', '3–4 vezes por semana', 'Toda noite'] },
  { q: 'Como você se sente ao acordar?', options: ['Descansado', 'Ok, mas lento', 'Cansado', 'Exausto, como se não tivesse dormido'] },
  { q: 'Você usa tela (celular, TV) na cama?', options: ['Nunca', 'Às vezes', 'Quase sempre', 'Sempre — adormeço com ela'] },
  { q: 'Quantas xícaras de café/chá preto você toma por dia?', options: ['Nenhuma', '1–2', '3–4', '5 ou mais'] },
  { q: 'Como descreveria seu nível de estresse atual?', options: ['Baixo', 'Moderado', 'Alto', 'Muito alto, constante'] },
];
