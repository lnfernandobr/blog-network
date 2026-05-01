import { jsonOutputContract } from './_shared.js';

export interface GenerateImagePromptInput {
  articleTitle: string;
  articleSummary: string;
  niche: string;
  /** Estilo visual base do canal — opcional. Se não informado, default editorial. */
  visualStyle?: string;
}

const SYSTEM = `
Você é diretor de arte criando o brief visual da imagem de capa.

REGRAS:
- A imagem é editorial fotográfica, nunca infográfico, nunca colagem, nunca render 3D estilizado.
- 16:9, foco claro num assunto principal, profundidade de campo (background levemente desfocado).
- Iluminação natural ou suave, paleta consistente com o nicho.
- SEM TEXTO sobreposto (imagens com texto ficam ruins em redes e em cards).
- SEM logos de marcas reais.
- Composição que funciona em thumbnail (legível a 320px de largura).

OUTPUT:
- prompt: descrição rica em INGLÊS (modelos de imagem performam melhor em inglês), no estilo de um roteiro de fotografia editorial. Inclui sujeito, contexto, iluminação, ângulo, cores, clima, lente sugerida.
- negativePrompt: o que evitar (texto, watermark, low quality, cartoon, etc.)
- alt: alt-text descritivo em português (idioma do site), 80-140 chars, descrevendo a cena pra leitores de tela.
- mood: 1-3 palavras descrevendo a sensação (ex: "calmo, matinal, tátil")
`;

export const generateImagePromptPrompt = {
  name: 'generate-image-prompt',
  system: SYSTEM,
  user: (input: GenerateImagePromptInput): string => {
    const lines: string[] = [];
    lines.push(`Nicho: ${input.niche}`);
    lines.push(`Título do post: ${input.articleTitle}`);
    lines.push(`Resumo: ${input.articleSummary}`);
    if (input.visualStyle) lines.push(`Estilo do canal: ${input.visualStyle}`);
    lines.push('');
    lines.push('Crie o brief visual.');
    lines.push(
      jsonOutputContract({
        prompt:
          'Editorial photograph, [subject doing action], [setting], [lighting], shot on [camera/lens style], [mood], shallow depth of field, 16:9, no text, no watermark.',
        negativePrompt: 'text, watermark, logo, low quality, cartoon, illustration, 3d render, oversaturated',
        alt: 'Descrição da cena em português, 80-140 chars',
        mood: '2-3 palavras',
      }),
    );
    return lines.join('\n');
  },
};
