import { API_URL, CHANNEL_SLUG } from './config';
import type {
  AuthorDto,
  CategoryDto,
  ChannelDto,
  PostDto,
  TagDto,
} from '@bn/shared';

interface FetchOpts {
  next?: { tags?: string[]; revalidate?: number };
  cache?: 'force-cache' | 'no-store';
}

async function getJson<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    cache: opts.cache,
    next: opts.next ?? { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} for ${url}`);
  }
  return (await res.json()) as T;
}

const baseTag = (extra?: string) => [`channel:${CHANNEL_SLUG}`, ...(extra ? [extra] : [])];

export async function getChannel(): Promise<ChannelDto> {
  return getJson<ChannelDto>(`/api/v1/public/channels/${CHANNEL_SLUG}`, {
    next: { tags: baseTag(), revalidate: 600 },
  });
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listPosts(
  query: { page?: number; limit?: number; category?: string; author?: string; tag?: string; q?: string; featured?: boolean } = {},
): Promise<Paginated<PostDto>> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  return getJson<Paginated<PostDto>>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/posts?${qs.toString()}`,
    { next: { tags: ['posts', ...baseTag()], revalidate: 60 } },
  );
}

export async function getPost(slug: string): Promise<PostDto | null> {
  try {
    return await getJson<PostDto>(`/api/v1/public/channels/${CHANNEL_SLUG}/posts/${slug}`, {
      next: { tags: [`post:${CHANNEL_SLUG}:${slug}`, 'posts', ...baseTag()], revalidate: 120 },
    });
  } catch {
    return null;
  }
}

export async function getRelated(slug: string, limit = 4): Promise<PostDto[]> {
  try {
    const data = await getJson<{ items: PostDto[] }>(
      `/api/v1/public/channels/${CHANNEL_SLUG}/related/${slug}?limit=${limit}`,
      { next: { tags: ['posts', ...baseTag()], revalidate: 300 } },
    );
    return data.items;
  } catch {
    return [];
  }
}

export async function listCategories(): Promise<CategoryDto[]> {
  const data = await getJson<{ items: CategoryDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/categories`,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function getCategory(slug: string): Promise<CategoryDto | null> {
  try {
    return await getJson<CategoryDto>(
      `/api/v1/public/channels/${CHANNEL_SLUG}/categories/${slug}`,
      { next: { tags: baseTag(), revalidate: 600 } },
    );
  } catch {
    return null;
  }
}

export async function listAuthors(): Promise<AuthorDto[]> {
  const data = await getJson<{ items: AuthorDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/authors`,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function getAuthor(slug: string): Promise<AuthorDto | null> {
  try {
    return await getJson<AuthorDto>(
      `/api/v1/public/channels/${CHANNEL_SLUG}/authors/${slug}`,
      { next: { tags: baseTag(), revalidate: 600 } },
    );
  } catch {
    return null;
  }
}

export async function listTags(): Promise<TagDto[]> {
  const data = await getJson<{ items: TagDto[] }>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/tags`,
    { next: { tags: baseTag(), revalidate: 600 } },
  );
  return data.items;
}

export async function searchPosts(q: string, page = 1, limit = 20): Promise<Paginated<PostDto>> {
  const qs = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  return getJson<Paginated<PostDto>>(
    `/api/v1/public/channels/${CHANNEL_SLUG}/search?${qs.toString()}`,
    { next: { revalidate: 60 } },
  );
}

export async function getSitemapData(): Promise<{
  posts: { slug: string; updatedAt: string }[];
  categories: { slug: string; updatedAt: string }[];
  authors: { slug: string; updatedAt: string }[];
}> {
  return getJson(
    `/api/v1/public/channels/${CHANNEL_SLUG}/sitemap`,
    { next: { tags: ['posts', ...baseTag()], revalidate: 300 } },
  );
}
