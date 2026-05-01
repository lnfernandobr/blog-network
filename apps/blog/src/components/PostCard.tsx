import Link from 'next/link';
import Image from 'next/image';
import type { PostDto } from '@bn/shared';

export function PostCard({ post, priority = false }: { post: PostDto; priority?: boolean }) {
  return (
    <article className="group flex flex-col gap-3 rounded-lg overflow-hidden border bg-[var(--color-card)] transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.slug}` as any} className="block">
        <div className="relative aspect-[16/9] bg-black/5">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>
      </Link>
      <div className="flex flex-col gap-2 p-4 pt-2">
        {post.category ? (
          <Link
            href={`/categoria/${post.category.slug}` as any}
            className="text-xs uppercase tracking-wide text-[var(--color-accent)] hover:underline"
          >
            {post.category.name}
          </Link>
        ) : null}
        <h2 className="serif text-xl leading-snug font-semibold">
          <Link href={`/posts/${post.slug}` as any} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="text-sm text-[var(--color-muted)] line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-[var(--color-muted)] pt-1">
          {post.author ? (
            <Link href={`/autor/${post.author.slug}` as any} className="hover:text-[var(--color-fg)]">
              {post.author.name}
            </Link>
          ) : null}
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </time>
          ) : null}
        </div>
      </div>
    </article>
  );
}
