'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function Navbar({ onOpenPost }: { onOpenPost: () => void }) {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-[var(--shadow-md)]' : 'bg-transparent'
      }`}
    >
      <nav className="container h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#6366f1,#a855f7)] shadow-[0_6px_18px_-4px_rgba(139,92,246,0.7)] transition-transform group-hover:rotate-[-8deg] group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </span>
          <span className="font-display font-bold text-lg tracking-tight aurora-text">Studygram</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === 'loading' ? (
            <div className="skeleton w-24 h-9 rounded-2xl" />
          ) : session?.user ? (
            <>
              <Button variant="primary" size="sm" onClick={onOpenPost} className="hidden sm:inline-flex">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Share a doubt
              </Button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full"
                  aria-label="Account menu"
                >
                  <span className="inline-block rounded-full ring-2 ring-transparent transition-all hover:ring-indigo-400/70">
                    <Avatar
                      src={session.user.image}
                      name={session.user.name || 'User'}
                      size="md"
                    />
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 glass-strong rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] animate-scale-in z-50">
                    <div className="px-4 py-3.5 flex items-center gap-3 border-b border-[var(--border-color)]">
                      <Avatar src={session.user.image} name={session.user.name || 'User'} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{session.user.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{session.user.email}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setMenuOpen(false); onOpenPost(); }}
                        className="w-full sm:hidden text-left px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                      >
                        Share a doubt
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-rose-300 hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => signIn('google', { callbackUrl: '/' })}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 10.27V14h6.06c-.26 1.53-1.06 2.83-2.26 3.7l3.62 2.8c2.13-1.96 3.35-4.84 3.35-8.26 0-.78-.07-1.53-.2-2.25z" />
                <path d="M8.5 13.52a2 2 0 0 0 0 .99l-4.06 3.15c.97 1.92 3.2 3.3 5.95 3.3 1.83 0 3.43-.6 4.57-1.63l-3.62-2.8c-.5.34-1.14.54-1.9.54-1.7 0-3.14-1.15-3.66-2.7z" fillOpacity="0.6" />
                <path d="M8.5 11.5l-.06 1-4.06-3.15A5.5 5.5 0 0 0 9.5 5.2l3.02 2.1a5.7 5.7 0 0 1 4.2-.08l3.2-2.6A6.5 6.5 0 0 0 8.5 11.5z" fillOpacity="0.5" />
              </svg>
              Sign in
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}