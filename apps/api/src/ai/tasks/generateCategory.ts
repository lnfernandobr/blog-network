import { prompts, type CategoryPromptInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson, slugify } from './shared.js';

export interface GeneratedCategory {
  slug: string;
  name: string;
  description?: string;
}

export async function generateCategory(input: CategoryPromptInput): Promise<GeneratedCategory> {
  const provider = getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.category.system },
      { role: 'user', content: prompts.category.user(input) },
    ],
  });
  const data = parseJson<Partial<GeneratedCategory>>(result.text);
  const name = (data.name ?? 'Geral').toString();
  const slug = (data.slug && /^[a-z0-9-]+$/.test(data.slug) ? data.slug : slugify(name)).slice(0, 60);
  return {
    slug,
    name: name.slice(0, 80),
    description: data.description ? String(data.description).slice(0, 600) : undefined,
  };
}
