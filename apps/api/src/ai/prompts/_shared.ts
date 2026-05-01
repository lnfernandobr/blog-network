/**
 * Regras editoriais compartilhadas — incluídas no `system` de TODOS os prompts
 * que geram conteúdo redigido (outline, artigo, metadata).
 *
 * São guardrails contra os padrões clássicos de "texto de IA": fluff,
 * hedging, frases-elevador. Quanto mais específico aqui, menos genérico
 * sai do modelo.
 */
export const EDITORIAL_RULES = `
REGRAS EDITORIAIS ABSOLUTAS:
1. Especificidade > generalidade. Use números, gramaturas, tempos, temperaturas, preços, modelos, anos, marcas — sempre que possível. "Moa por 18s no nível 6" > "moa adequadamente".
2. Voz ativa, frases curtas. Frases passivas e longas são sintoma de IA. Mude pra ativa direta.
3. NUNCA use estas frases (banidas):
   - "No mundo de hoje em dia"
   - "É importante notar/destacar/ressaltar"
   - "Em conclusão" / "Em resumo" / "Para concluir"
   - "Esperamos que este artigo"
   - "Existem várias maneiras de"
   - "Muitas pessoas se perguntam"
   - "Vamos explorar" / "Vamos descobrir"
   - "Mergulhar no mundo de"
   - Qualquer abertura tipo "Você já se perguntou…"
4. Sem hedging excessivo. Em vez de "pode ser que talvez seja interessante considerar X", escreva "X funciona porque Y".
5. Opinião quando faz sentido. Conteúdo bom toma posição. "Y é melhor que X em Z cenário" >>> "ambos têm vantagens".
6. Cite fontes específicas quando alegar fato externo. "Segundo a SCA (2024)..." em vez de "estudos mostram".
7. Evite parágrafo-elevador no início. Parágrafo 1 já entrega valor: tese + contexto + por que importa. Sem "neste artigo vamos abordar".
8. Use listas/tabelas quando houver enumeração ou comparação real. Não use lista pra disfarçar texto fraco.
9. Português direto. Evite "ipsis litteris", "outrossim", "destarte" e similares.
`;

/**
 * Princípios de SEO/GEO aplicáveis a qualquer artigo. São lembretes
 * embutidos nos prompts pra o modelo otimizar sem precisar de pós-processamento.
 */
export const SEO_GEO_RULES = `
PRINCÍPIOS DE SEO + GEO (citação por LLMs):
- Title 50-60 chars com a palavra-chave principal nos primeiros 30 chars.
- Meta description 140-160 chars com o benefício concreto (não "saiba mais").
- H1 único, idêntico ou variação próxima do title.
- H2s respondem perguntas ou marcam etapas. H3s detalham.
- "Answer-first": o primeiro parágrafo de cada seção responde a pergunta da seção em 1-2 frases. Depois aprofunda.
- Tabelas comparativas e listas numeradas têm alta taxa de citação por LLMs e featured snippets do Google.
- FAQ ao final com 3-5 perguntas reais que o leitor faria.
- Mencione o ano corrente quando relevante ("guia atualizado para 2026").
- Slug em kebab-case, máx 60 chars, com palavra-chave principal.
`;

/**
 * Output JSON estrito é assumido por todas as skills. Esse trecho
 * é colado no fim do user message pra reforçar o formato esperado.
 */
export function jsonOutputContract(schemaExample: unknown): string {
  return `\nResponda SOMENTE com JSON válido neste formato (sem markdown, sem comentários):\n${JSON.stringify(
    schemaExample,
    null,
    2,
  )}`;
}
