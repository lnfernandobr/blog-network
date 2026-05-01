import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const authorSchema = new Schema(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    jobTitle: { type: String },
    shortBio: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
    expertise: { type: [String], default: [] },
    credentials: { type: [String], default: [] },
    socials: {
      instagram: String,
      twitter: String,
      linkedin: String,
      website: String,
      youtube: String,
      email: String,
    },
  },
  { timestamps: true },
);

authorSchema.index({ channelId: 1, slug: 1 }, { unique: true });

export type AuthorDoc = InferSchemaType<typeof authorSchema> & { _id: Types.ObjectId };
export const Author: Model<AuthorDoc> = model<AuthorDoc>('Author', authorSchema);
