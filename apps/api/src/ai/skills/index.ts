/**
 * Skills da camada de IA.
 *
 * Cada skill é uma unidade reutilizável de geração: input tipado, prompt
 * centralizado em ai/prompts/, output estruturado e parseado. Pipelines
 * compõem skills em sequência (apps/api/src/pipeline/steps/).
 */

export { brainstormTopics, type BrainstormResult } from './brainstormTopics.js';
export { selectTopic, type SelectedTopic } from './selectTopic.js';
export { outlineArticle, type ArticleOutline } from './outlineArticle.js';
export { writeArticle, type WrittenArticle } from './writeArticle.js';
export { generateMetadata, type ArticleMetadata } from './generateMetadata.js';
export { generateImagePromptBrief, type ImageBrief } from './generateImagePrompt.js';
export { generateImage, type GeneratedImage, type GenerateImageInput } from './generateImage.js';
export { generateCategory, type GeneratedCategory } from './generateCategory.js';
export { generateTags, type GeneratedTags } from './generateTags.js';
export {
  analyzeSite,
  type SiteAnalysis,
  type SiteInsight,
  type InsightArea,
  type InsightSeverity,
} from './analyzeSite.js';
