import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { Channel } from '../models/Channel.js';

/**
 * Notifica o site externo (siteUrl do canal) para invalidar o cache ISR
 * após publicação/edição/exclusão de um post.
 *
 * O contrato com o site é: `POST {siteUrl}/api/revalidate?secret=...` com
 * body `{ tags, channelSlug, postSlug }`. Cabe ao site implementar essa rota.
 */
export async function revalidateChannel(channelId: string, postSlug?: string): Promise<void> {
  const channel = await Channel.findById(channelId).lean();
  if (!channel || !channel.siteUrl) return;

  const tags = ['posts', `channel:${channel.slug}`];
  if (postSlug) tags.push(`post:${channel.slug}:${postSlug}`);

  const url = `${channel.siteUrl.replace(/\/$/, '')}/api/revalidate?secret=${encodeURIComponent(
    env.REVALIDATE_SECRET,
  )}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tags, channelSlug: channel.slug, postSlug }),
    });
    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'revalidate request failed');
    } else {
      logger.info({ url, tags }, 'revalidate dispatched');
    }
  } catch (err) {
    logger.warn({ err, url }, 'revalidate request error');
  }
}
