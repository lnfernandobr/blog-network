import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const tagSchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

tagSchema.index({ channelId: 1, slug: 1 }, { unique: true });

export type TagDoc = InferSchemaType<typeof tagSchema> & { _id: Types.ObjectId };
export const Tag: Model<TagDoc> = model<TagDoc>('Tag', tagSchema);
