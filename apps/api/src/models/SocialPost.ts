import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const socialPostImageSchema = new Schema(
  {
    url: { type: String, required: true },
    localPath: { type: String },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    prompt: { type: String, required: true },
  },
  { _id: false },
);

const socialPostSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'SocialCampaign',
      required: true,
      index: true,
    },
    platform: { type: String, enum: ['tiktok'], required: true },
    status: {
      type: String,
      enum: ['generating', 'pending_review', 'published', 'failed'],
      default: 'generating',
      index: true,
    },
    topic: { type: String, required: true },
    caption: { type: String, default: '' },
    hashtags: { type: [String], default: [] },
    images: { type: [socialPostImageSchema], default: [] },
    platformPostId: { type: String },
    platformShareUrl: { type: String },
    notificationSentAt: { type: Date },
    publishedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true },
);

export type SocialPostDoc = InferSchemaType<typeof socialPostSchema> & { _id: Types.ObjectId };
export const SocialPost: Model<SocialPostDoc> = model<SocialPostDoc>(
  'SocialPost',
  socialPostSchema,
);
