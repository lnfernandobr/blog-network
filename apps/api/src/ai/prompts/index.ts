/**
 * Mapper centralizado de prompts.
 *
 * REGRAS:
 * 1. Tudo que é prompt vive em apps/api/src/ai/prompts/. Nenhuma skill ou
 *    provider declara prompts inline — sempre referencia exports daqui.
 * 2. 1 prompt = 1 arquivo, pra revisão isolada e diff cirúrgico.
 * 3. _shared.ts tem regras editoriais e SEO/GEO embutidas em vários prompts.
 *    Alterar lá afeta todos os prompts que importam.
 *
 * Pra adicionar prompt novo:
 *   1. Cria arquivo em ai/prompts/nomeDaSkill.ts
 *   2. Exporta `<nomeDaSkill>Prompt = { name, system, user }`
 *   3. Adiciona re-export em `prompts.<nomeDaSkill>` abaixo
 *   4. Cria skill correspondente em ai/skills/
 */

import { brainstormTopicsPrompt } from './brainstormTopics.js';
import { selectTopicPrompt } from './selectTopic.js';
import { outlineArticlePrompt } from './outlineArticle.js';
import { writeArticlePrompt } from './writeArticle.js';
import { generateMetadataPrompt } from './generateMetadata.js';
import { generateImagePromptPrompt } from './generateImagePrompt.js';
import { generateCategoryPrompt } from './generateCategory.js';
import { generateTagsPrompt } from './generateTags.js';
import { analyzeSitePrompt } from './analyzeSite.js';

export const prompts = {
  brainstormTopics: brainstormTopicsPrompt,
  selectTopic: selectTopicPrompt,
  outlineArticle: outlineArticlePrompt,
  writeArticle: writeArticlePrompt,
  generateMetadata: generateMetadataPrompt,
  generateImagePrompt: generateImagePromptPrompt,
  generateCategory: generateCategoryPrompt,
  generateTags: generateTagsPrompt,
  analyzeSite: analyzeSitePrompt,
} as const;

export type PromptName = keyof typeof prompts;

// Re-exports dos tipos de input pra cada skill consumir
export type { BrainstormTopicsInput } from './brainstormTopics.js';
export type { SelectTopicInput, TopicCandidate } from './selectTopic.js';
export type { OutlineArticleInput } from './outlineArticle.js';
export type { WriteArticleInput } from './writeArticle.js';
export type { GenerateMetadataInput } from './generateMetadata.js';
export type { GenerateImagePromptInput } from './generateImagePrompt.js';
export type { GenerateCategoryInput } from './generateCategory.js';
export type { GenerateTagsInput } from './generateTags.js';
export type { AnalyzeSitePromptInput } from './analyzeSite.js';
