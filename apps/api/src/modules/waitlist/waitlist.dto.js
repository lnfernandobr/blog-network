export const toPublicEntry = (entry) =>
  entry === null
    ? null
    : {
        id: String(entry._id),
        phone: entry.phone,
        source: entry.source,
        createdAt: entry.createdAt,
      };
