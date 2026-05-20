import { Schema, model } from 'mongoose';

const WAITLIST_COLLECTION = 'WaitlistEntry';

const waitlistEntrySchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: 'brotinho',
      index: true,
    },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true },
);

export const WaitlistEntryModel = model(WAITLIST_COLLECTION, waitlistEntrySchema);
