'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  ImageIcon,
  Activity,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { clearToken, getToken } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Button } from './ui/button';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts', icon: Link2 },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/posts', label: 'Posts', icon: ImageIcon },
  { href: '/runs', label: 'Runs', icon: Activity },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const stored = localStorage.getItem('sa_theme');
    const initial =
      (stored as 'light' | 'dark') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', initial === 'dark');
    setTheme(initial);
  }, [router]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('sa_theme', next);
    setTheme(next);
  }

  function logout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 flex-col border-r bg-[var(--color-card)] lg:flex">
        <div className="flex h-14 items-center gap-2.5 px-5 border-b">
          <div className="h-6 w-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-base font-semibold tracking-tight">Social Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                    : 'hover:bg-black/5 dark:hover:bg-white/5',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={logout} className="flex-1">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="lg:hidden border-b bg-[var(--color-card)] px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Social Admin</span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 lg:p-10 max-w-screen-xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
