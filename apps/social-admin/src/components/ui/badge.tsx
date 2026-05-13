import * as React from 'react';
import { cn } from '@/lib/cn';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'success' | 'warn' | 'error';
}) {
  const map = {
    default: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
    secondary: 'bg-black/5 dark:bg-white/10',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    warn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        map[variant],
        className,
      )}
      {...props}
    />
  );
}
