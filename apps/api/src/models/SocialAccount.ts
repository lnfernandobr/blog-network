import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const socialAccountSchema = new Schema(
  {
    platform: { type: String, enum: ['tiktok'], required: true },
    platformUserId: { type: String, required: true },
    username: { type: String, required: true },
    displayName: { type: String },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

socialAccountSchema.index({ platform: 1, platformUserId: 1 }, { unique: true });

export type SocialAccountDoc = InferSchemaType<typeof socialAccountSchema> & {
  _id: Types.ObjectId;
};
export const SocialAccount: Model<SocialAccountDoc> = model<SocialAccountDoc>(
  'SocialAccount',
  socialAccountSchema,
);
