import type { SocialCampaignDoc } from '../../models/SocialCampaign.js';
import type { SocialPostDoc } from '../../models/SocialPost.js';
import type { SocialRunDoc } from '../../models/SocialRun.js';

export interface SocialPostImage {
  url: string;
  localPath?: string;
  alt: string;
  width: number;
  height: number;
  prompt: string;
}

export interface SocialPipelineContext {
  campaign: SocialCampaignDoc & { _id: any };
  run: SocialRunDoc & { _id: any };
  topic?: string;
  topicAngle?: string;
  caption?: string;
  hashtags?: string[];
  imagePrompts?: string[];
  images?: SocialPostImage[];
  post?: SocialPostDoc & { _id: any };
}

export type SocialPipelineStep = (ctx: SocialPipelineContext) => Promise<void>;
