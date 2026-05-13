import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const socialRunStepSchema = new Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'success', 'error', 'partial'],
      required: true,
    },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    message: { type: String },
  },
  { _id: false },
);

const socialRunSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'SocialCampaign',
      required: true,
      index: true,
    },
    trigger: { type: String, enum: ['cron', 'manual'], required: true },
    cronExpression: { type: String },
    status: {
      type: String,
      enum: ['queued', 'running', 'success', 'error', 'partial'],
      default: 'queued',
      index: true,
    },
    startedAt: { type: Date, default: () => new Date(), index: true },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    steps: { type: [socialRunStepSchema], default: [] },
    postId: { type: Schema.Types.ObjectId, ref: 'SocialPost' },
    error: { type: String },
  },
  { timestamps: true },
);

export type SocialRunDoc = InferSchemaType<typeof socialRunSchema> & { _id: Types.ObjectId };
export const SocialRun: Model<SocialRunDoc> = model<SocialRunDoc>('SocialRun', socialRunSchema);
