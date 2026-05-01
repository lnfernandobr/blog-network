import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const categorySchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#0f172a' },
    iconKey: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ channelId: 1, slug: 1 }, { unique: true });

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: Types.ObjectId };
export const Category: Model<CategoryDoc> = model<CategoryDoc>('Category', categorySchema);
