import { createEntry, findEntryByPhone } from './waitlist.repository.js';
import { toPublicEntry } from './waitlist.dto.js';

const DEFAULT_SOURCE = 'brotinho';
const MONGO_DUPLICATE_KEY = 11000;

export const addToWaitlist = async ({ phone, source, ip, userAgent }) => {
  const finalSource = source ?? DEFAULT_SOURCE;

  const existing = await findEntryByPhone(phone);
  if (existing) {
    return { entry: toPublicEntry(existing), alreadyOnList: true };
  }

  try {
    const created = await createEntry({ phone, source: finalSource, ip, userAgent });
    return { entry: toPublicEntry(created.toObject()), alreadyOnList: false };
  } catch (err) {
    if (err?.code === MONGO_DUPLICATE_KEY) {
      const racedEntry = await findEntryByPhone(phone);
      return { entry: toPublicEntry(racedEntry), alreadyOnList: true };
    }
    throw err;
  }
};
