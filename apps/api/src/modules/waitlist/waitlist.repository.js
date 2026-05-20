import { WaitlistEntryModel } from './waitlist.model.js';

export const findEntryByPhone = (phone) => WaitlistEntryModel.findOne({ phone }).lean();

export const createEntry = ({ phone, source, ip, userAgent }) =>
  WaitlistEntryModel.create({ phone, source, ip, userAgent });

export const countEntriesBySource = (source) => WaitlistEntryModel.countDocuments({ source });
