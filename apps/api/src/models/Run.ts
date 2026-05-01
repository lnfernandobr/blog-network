import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const runStepSchema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ['queued', 'running', 'success', 'error', 'partial'], required: true },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    message: { type: String },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const runSchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
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
    steps: { type: [runStepSchema], default: [] },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    error: { type: String },
  },
  { timestamps: true },
);

export type RunDoc = InferSchemaType<typeof runSchema> & { _id: Types.ObjectId };
export const Run: Model<RunDoc> = model<RunDoc>('Run', runSchema);
