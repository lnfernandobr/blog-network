import { compose, OUTPUT_DISCIPLINE } from '../blocks.js';
import { buildBrandProfile } from '../brand.js';
import { PHOTO_BRAND_DEFAULT, PHOTO_HOOK } from '../visual.js';
import type { ImageBriefingInput } from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 16. POST → BRIEFING VISUAL (texto, em pt-BR) ──────────────────────────

/**
 * Esse prompt produz um briefing conceitual em pt-BR. O briefing é a fonte
 * pra todos os prompts de imagem (cover, OG, thumb, internal, variations) que
 * vão converter o briefing em string em inglês para o gerador.
 *
 * Trabalhar em duas etapas (briefing pt-BR depois prompt en) reduz erro de
 * tradução e mantém a consistência visual entre todos os formatos do mesmo post.
 */
export const imageBriefingPrompt: PromptDef<ImageBriefingInput> = {
  name: 'image-briefing',
  category: 'visual',
  version: '1.1.0',
  description: 'Transforma o conteúdo do post em briefing visual conceitual (sujeito, ambiente, mood, paleta, detalhes-chave). Esse briefing alimenta todos os prompts de imagem.',
  system: compose(
    `Você é diretor de arte de revista editorial fotojornalística. Lê o resumo do post e produz um briefing visual coeso para uma fotografia documental real (não ilustração, não 3D, não banco de imagem genérico).

Regras:
- Pense fotograficamente, não como design gráfico. Real, humano, com luz natural ou cinematográfica.
- Sujeito principal precisa caber em todos os formatos (cover wide, OG, square, vertical).
- Mood e palette consistentes com a marca. Quando faltar instrução do canal, use o default editorial:

${PHOTO_BRAND_DEFAULT}

- KeyDetails: detalhes concretos, físicos e específicos que reforçam o conceito. Inclua textura, marca de uso, gesto humano, objeto fora do lugar. Exemplos bons: "xícara de chá esquecida no criado-mudo, vapor ainda visível", "lençol amarrotado mostrando que alguém acabou de levantar", "mão segurando o despertador com o polegar marcando o botão".
- Pelo menos UM dos keyDetails deve ser o **gancho visual**: um elemento decisivo, levemente inesperado, que prende o olhar (ver guia abaixo).
- Mood escrito em 3 a 6 palavras-chave em inglês (vão direto pro gerador). Ex: "intimate, candid, lived-in, warm".
- Palette descrita por surfaces e tons concretos, não por nomes de cor abstratos. Ex: "aged wood, brass with patina, navy shadow, warm amber lamp glow", não "cores quentes elegantes".
- Alt: descrição em pt-BR para acessibilidade, 80 a 140 chars, factual (descreve o que aparece, não o conceito).
- IMPORTANTE: o briefing NÃO descreve texto na imagem. A imagem final não pode ter letras/títulos/legendas; nunca peça "com a palavra X escrita" ou similar.

Diretriz de gancho visual (em inglês, será passada adiante ao gerador):
${PHOTO_HOOK}`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título do post: ${input.articleTitle}`);
    lines.push(`Resumo: ${input.articleSummary}`);
    if (input.concept) lines.push(`Conceito-chave: ${input.concept}`);
    if (input.visualStyle) {
      lines.push('');
      lines.push(`Estilo visual do canal (sobrescreve o default da marca):`);
      lines.push(input.visualStyle);
    }
    return lines.join('\n');
  },
};
