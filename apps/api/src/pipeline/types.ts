import type { ChannelDoc } from '../models/Channel.js';
import type { RunDoc } from '../models/Run.js';
import type { PostDoc } from '../models/Post.js';
import type { AuthorDoc } from '../models/Author.js';
import type { CategoryDoc } from '../models/Category.js';
import type { GeneratedArticle, GeneratedImage } from '../ai/index.js';

export interface PipelineContext {
  channel: ChannelDoc & { _id: any };
  run: RunDoc & { _id: any };

  // Saídas das etapas (preenchidas conforme avançam)
  article?: GeneratedArticle;
  cover?: GeneratedImage;
  author?: AuthorDoc & { _id: any };
  category?: CategoryDoc & { _id: any };
  tagSlugs?: string[];
  post?: PostDoc & { _id: any };
}

export type PipelineStep = (ctx: PipelineContext) => Promise<void>;
