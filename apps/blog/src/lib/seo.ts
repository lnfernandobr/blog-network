import type { Metadata } from 'next';
import type {
  AuthorDto,
  CategoryDto,
  ChannelDto,
  PostDto,
} from '@bn/shared';
import { SITE_URL } from './config';

export function abs(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildBaseMetadata(channel: ChannelDto): Metadata {
  const description = `${channel.name} — conteúdo editorial sobre ${channel.niche}.`;
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: channel.name,
    title: { default: channel.name, template: `%s · ${channel.name}` },
    description,
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': '/feed.xml',
        'application/atom+xml': '/atom.xml',
      },
    },
    openGraph: {
      type: 'website',
      siteName: channel.name,
      locale: 'pt_BR',
      url: SITE_URL,
      title: channel.name,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: channel.name,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export function postMetadata(channel: ChannelDto, post: PostDto, author?: AuthorDto): Metadata {
  const url = abs(`/posts/${post.slug}`);
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: channel.name,
      title: post.metaTitle,
      description: post.metaDescription,
      locale: 'pt_BR',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAtContent ?? post.updatedAt,
      authors: author ? [author.name] : [],
      section: post.category?.name,
      tags: post.tags,
      images: [
        {
          url: post.coverImage.url,
          width: post.coverImage.width,
          height: post.coverImage.height,
          alt: post.coverImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.coverImage.url],
    },
  };
}

export function categoryMetadata(channel: ChannelDto, category: CategoryDto): Metadata {
  const url = abs(`/categoria/${category.slug}`);
  return {
    title: `${category.name} — ${channel.name}`,
    description: category.description ?? `Posts da categoria ${category.name} em ${channel.name}.`,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title: category.name, description: category.description ?? '' },
  };
}

export function authorMetadata(channel: ChannelDto, author: AuthorDto): Metadata {
  const url = abs(`/autor/${author.slug}`);
  return {
    title: `${author.name} — ${channel.name}`,
    description: author.shortBio ?? `Artigos por ${author.name} em ${channel.name}.`,
    alternates: { canonical: url },
    openGraph: { type: 'profile', url, title: author.name, description: author.shortBio ?? '' },
  };
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
