import { Author } from '../models/Author.js';
import type { PipelineStep } from './types.js';

/**
 * Resolve o autor do post.
 *
 * Hoje a regra é simples: usa o nome em `channel.defaultAuthorName` (default
 * "Fernando"), criando o registro de autor se ele não existir naquele canal.
 *
 * Futuro: poder pluggar `Author.fromAI(...)` quando quisermos personas
 * temáticas geradas dinamicamente.
 */
export const resolveAuthorStep: PipelineStep = async (ctx) => {
  const { channel } = ctx;
  const name = (channel.defaultAuthorName || 'Fernando').trim();
  const slug = slugify(name) || 'editor';

  let author = await Author.findOne({ channelId: channel._id, slug } as any);
  if (!author) {
    author = await Author.create({
      channelId: channel._id,
      slug,
      name,
      jobTitle: 'Editor',
      shortBio: `${name} é responsável editorial pelo ${channel.name}.`,
      bio: `# ${name}\n\nResponsável editorial pelo ${channel.name}, supervisiona toda a curadoria e revisão do conteúdo.`,
      expertise: [channel.niche],
      credentials: [],
      socials: {},
    });
  }
  ctx.author = author as any;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
