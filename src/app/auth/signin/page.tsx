'use client';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Hero3D = dynamic(() => import('@/components/three/Hero3D'), {
  ssr: false,
  loading: () => null,
});

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <Hero3D />
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb3d w-[420px] h-[420px] -top-24 -left-24 bg-indigo-600/25" />
        <div className="orb3d w-[380px] h-[380px] bottom-0 right-0 bg-cyan-500/20" style={{ animationDelay: '-6s' }} />
      </div>

      <div className="container relative z-10 flex justify-center">
        <div className="w-full max-w-md glass-strong rounded-3xl p-8 sm:p-10 text-center animate-scale-in">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[linear-gradient(135deg,#6366f1,#a855f7)] shadow-[0_8px_24px_-6px_rgba(139,92,246,0.8)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            <span className="font-display font-bold text-xl tracking-tight aurora-text">Studygram</span>
          </Link>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">
            {session ? 'Welcome back' : 'Join the community'}
          </h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            {session
              ? `You're signed in as ${session.user?.name}.`
              : 'Sign in to ask doubts, answer classmates and pick up right where you left off.'}
          </p>

          <div className="mt-8 space-y-3">
            {session ? (
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 rounded-2xl font-semibold text-white bg-[linear-gradient(115deg,#6366f1,#8b5cf6)] hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.8)] transition-all active:scale-[0.98]"
              >
                Continue to the feed
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    setLoading(true);
                    await signIn('google', { callbackUrl: '/' });
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[var(--text-primary)] glass hover:bg-white/[0.08] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.1 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 41.2 44 36 44 24c0-1.3-.1-2.6-.4-3.9z" />
                    </svg>
                  )}
                  {loading ? 'Redirecting to Google…' : 'Continue with Google'}
                </button>

                <Link
                  href="/"
                  className="block text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors pt-1"
                >
                  Just explore first →
                </Link>
              </>
            )}
          </div>

          <p className="mt-8 text-xs text-[var(--text-muted)] leading-relaxed">
            By continuing you agree to be kind. Studygram is a safe space for learning.
          </p>
        </div>
      </div>
    </div>
  );
}