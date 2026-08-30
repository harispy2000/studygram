'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard, PostItem } from '@/components/feed/PostCard';
import { PostForm } from '@/components/feed/PostForm';
import { useToast } from '@/components/ui/Toaster';
import { Button } from '@/components/ui/Button';

const Hero3D = dynamic(() => import('@/components/three/Hero3D'), {
  ssr: false,
  loading: () => null,
});

const SUBJECTS = [
  { value: 'All', label: 'Everything', emoji: '✨' },
  { value: 'Mathematics', label: 'Math', emoji: '📐' },
  { value: 'Physics', label: 'Physics', emoji: '⚛️' },
  { value: 'Chemistry', label: 'Chemistry', emoji: '🧪' },
  { value: 'Biology', label: 'Biology', emoji: '🧬' },
  { value: 'Computer Science', label: 'CS', emoji: '💻' },
  { value: 'Other', label: 'Other', emoji: '📖' },
];

const SORTS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Top liked' },
  { value: 'discussed', label: 'Most discussed' },
];

interface Stats {
  posts: number;
  users: number;
  comments: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('All');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats>({ posts: 0, users: 0, comments: 0 });
  const [filterOpen, setFilterOpen] = useState(false);

  const searchRef = useRef('');
  searchRef.current = search;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject !== 'All') params.set('subject', subject);
      if (sort) params.set('sort', sort);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setPosts(data);
    } catch {
      toast('Could not load posts', 'error');
      setPosts([]);
    }
    setLoading(false);
  }, [subject, sort, search, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => fetchPosts(), 350);
    return () => window.clearTimeout(t);
  }, [search, fetchPosts]);

  const handleCreate = async (subj: string, content: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subj, content }),
      });
      if (!res.ok) throw new Error();
      toast('Your doubt is live 🎉', 'success');
      setSubject(subj);
      setSearch('');
      await fetchPosts();
    } catch {
      toast('Could not create post', 'error');
    }
  };

  const writerRef = useRef<HTMLDivElement>(null);
  const typeEffect = () => {
    const el = writerRef.current;
    if (!el) return;
    const phrases = ['Mathematics.', 'Physics.', 'Chemistry.', 'Biology.', 'Computer Science.'];
    let p = 0;
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = phrases[p % phrases.length];
      i = deleting ? i - 1 : i + 1;
      el.textContent = current.slice(0, i);
      let speed = deleting ? 35 : 80;
      if (!deleting && i === current.length) {
        speed = 1800;
        deleting = true;
      } else if (deleting && i === 0) {
        deleting = false;
        p += 1;
        speed = 350;
      }
      timer = setTimeout(tick, speed);
    };
    tick();
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = typeEffect();
    return cleanup;
  }, []);

  const activeSubject = SUBJECTS.find((s) => s.value === subject)!;

  return (
    <div className="min-h-screen">
      <Navbar onOpenPost={() => (session ? setShowModal(true) : signIn('google', { callbackUrl: '/' }))} />

      {/* ---------- HERO ---------- */}
      <section className="relative min-h-[72vh] flex flex-col justify-center overflow-hidden">
        <Hero3D />
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb3d w-[480px] h-[480px] -top-32 -left-32 bg-indigo-600/30" />
          <div className="orb3d w-[420px] h-[420px] top-1/3 -right-40 bg-fuchsia-600/25" style={{ animationDelay: '-5s' }} />
          <div className="orb3d w-[360px] h-[360px] bottom-0 left-1/4 bg-cyan-500/20" style={{ animationDelay: '-9s' }} />
          <div className="absolute top-10 right-[12%] conic-ring w-40 h-40 opacity-40" />
          <div className="absolute bottom-16 left-[8%] conic-ring w-24 h-24 opacity-25" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="container relative z-10 py-24">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Built by students, for students
            </span>

            <h1 className="mt-6 font-display font-extrabold leading-[1.06] tracking-tight text-4xl sm:text-6xl text-[var(--text-primary)]">
              Turn every doubt into a{' '}
              <span className="aurora-text">breakthrough.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Stuck on a tough problem? Ask the Studygram community and get clear,
              step-by-step answers from classmates who have been there — across{' '}
              <span ref={writerRef} className="text-indigo-300 font-semibold" />{' '}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {session ? (
                <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Ask a question
                </Button>
              ) : (
                <Button variant="primary" size="lg" onClick={() => signIn('google', { callbackUrl: '/' })}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.5 10.27V14h6.06c-.26 1.53-1.06 2.83-2.26 3.7l3.62 2.8c2.13-1.96 3.35-4.84 3.35-8.26 0-.78-.07-1.53-.2-2.25z" />
                    <path d="M8.5 13.52a2 2 0 0 0 0 .99l-4.06 3.15c.97 1.92 3.2 3.3 5.95 3.3 1.83 0 3.43-.6 4.57-1.63l-3.62-2.8c-.5.34-1.14.54-1.9.54-1.7 0-3.14-1.15-3.66-2.7z" fillOpacity="0.6" />
                    <path d="M8.5 11.5l-.06 1-4.06-3.15A5.5 5.5 0 0 0 9.5 5.2l3.02 2.1a5.7 5.7 0 0 1 4.2-.08l3.2-2.6A6.5 6.5 0 0 0 8.5 11.5z" fillOpacity="0.5" />
                  </svg>
                  Sign in with Google
                </Button>
              )}
              <a href="#feed">
                <Button variant="ghost" size="lg">
                  Browse the feed
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { value: stats.posts, label: 'doubts shared' },
                { value: stats.comments, label: 'answers given' },
                { value: stats.users, label: 'classmates' },
              ].map((s, i) => (
                <div key={s.label} className={`animate-slide-up stagger-${i + 2}`}>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">
                    {s.value.toLocaleString()}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">+</span>
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-[var(--bg-primary)] pointer-events-none" />
      </section>

      {/* ---------- FEED ---------- */}
      <section id="feed" className="container relative z-10 pb-28">
        <div className="pt-4 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">Community feed</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Fresh doubts and answers, one scroll away.</p>
          </div>
          {session && (
            <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
              New doubt
            </Button>
          )}
        </div>

        {/* Filter toolbar */}
        <div className="sticky top-16 z-30 mt-5 -mx-1 px-1 py-2 glass-strong rounded-2xl">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-1">
            {SUBJECTS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setSubject(s.value); }}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  subject === s.value
                    ? 'bg-[linear-gradient(115deg,#6366f1,#8b5cf6)] text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.7)]'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{s.emoji}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-2 pb-1">
            <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-[var(--border-color)] rounded-xl px-3 py-2 focus-within:border-indigo-400/50 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-[var(--text-muted)] flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doubts…"
                className="w-full text-sm bg-transparent placeholder:text-[var(--text-muted)]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Clear search">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.04] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)] transition-all"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                <span className="hidden sm:inline">{SORTS.find((s) => s.value === sort)?.label}</span>
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl overflow-hidden shadow-[var(--shadow-lg)] animate-scale-in z-40">
                  {SORTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setSort(s.value); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        sort === s.value
                          ? 'text-indigo-300 bg-indigo-500/10 font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result meta */}
        <p className="mt-5 text-sm text-[var(--text-muted)]">
          {loading
            ? 'Loading doubts…'
            : `${posts.length} ${posts.length === 1 ? 'doubt' : 'doubts'} in ${activeSubject.label.toLowerCase()}${search.trim() ? ` matching “${search.trim()}”` : ''}`}
        </p>

        {/* Posts */}
        <div className="mt-4 space-y-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-surface rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-1/3" />
                      <div className="skeleton h-3 w-1/4" />
                    </div>
                    <div className="skeleton h-6 w-20 rounded-full" />
                  </div>
                  <div className="mt-4 space-y-2.5">
                    <div className="skeleton h-3.5 w-full" />
                    <div className="skeleton h-3.5 w-5/6" />
                    <div className="skeleton h-3.5 w-2/3" />
                  </div>
                </div>
              ))
            : posts.length === 0
              ? (
                  <div className="glass rounded-3xl px-6 py-14 text-center animate-scale-in">
                    <div className="text-5xl mb-4">{search.trim() ? '🔎' : activeSubject.emoji}</div>
                    <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">Nothing here yet</h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                      {search.trim()
                        ? `No doubts match “${search.trim()}”. Try a different word, or be the first to ask.`
                        : `No ${activeSubject.label.toLowerCase()} doubts yet. Be the first to share one!`}
                    </p>
                    <div className="mt-6 inline-flex">
                      {session ? (
                        <Button variant="primary" onClick={() => setShowModal(true)}>Ask the first question</Button>
                      ) : (
                        <Button variant="primary" onClick={() => signIn('google', { callbackUrl: '/' })}>Sign in to ask</Button>
                      )}
                    </div>
                  </div>
                )
              : posts.map((post) => (
                  <PostCard key={post._id} post={post} onRefresh={fetchPosts} />
                ))}
        </div>
      </section>

      {/* ---------- MINI FOOTER ---------- */}
      <footer className="container pb-8 pt-2 border-t border-[var(--border-color)] text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Made with <span className="text-rose-400">♥</span> by the Studygram community — ask, answer, grow.
        </p>
      </footer>

      {/* ---------- FAB ---------- */}
      {session && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-2xl text-white bg-[linear-gradient(135deg,#6366f1,#a855f7)] shadow-[0_12px_40px_-8px_rgba(139,92,246,0.8)] hover:scale-110 active:scale-95 transition-transform"
          aria-label="Ask a question"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      <PostForm isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleCreate} />
    </div>
  );
}