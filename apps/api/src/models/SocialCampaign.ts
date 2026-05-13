import { Schema, model, type InferSchemaType, type Model, Types } from 'mongoose';

const promptConfigSchema = new Schema(
  {
    contentTypes: { type: [String], default: ['educational', 'listicle'] },
    visualStyle: { type: String, default: 'vibrant editorial photography, high contrast' },
    tone: { type: String, default: 'educational and inspiring' },
    targetAudience: { type: String, default: '' },
    extraContext: { type: String, default: '' },
  },
  { _id: false },
);

const socialCampaignSchema = new Schema(
  {
    name: { type: String, required: true },
    niche: { type: String, required: true },
    language: { type: String, default: 'pt-BR' },
    timezone: { type: String, default: 'America/Sao_Paulo' },
    active: { type: Boolean, default: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'SocialAccount', required: true, index: true },
    imageCount: { type: Number, default: 5, min: 1, max: 10 },
    notificationEmail: { type: String, required: true },
    publishTimes: { type: [String], default: ['09:00'] },
    publishWeekdays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    promptConfig: { type: promptConfigSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type SocialCampaignDoc = InferSchemaType<typeof socialCampaignSchema> & {
  _id: Types.ObjectId;
};
export const SocialCampaign: Model<SocialCampaignDoc> = model<SocialCampaignDoc>(
  'SocialCampaign',
  socialCampaignSchema,
);
