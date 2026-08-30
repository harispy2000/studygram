'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { TiltCard } from '@/components/ui/TiltCard';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toaster';

export interface CommentItem {
  _id: string;
  user: { name: string; image?: string; _id: string };
  text: string;
  createdAt: string;
}

export interface PostItem {
  _id: string;
  user: { name: string; image?: string; _id: string } | null;
  subject: string;
  content: string;
  comments: CommentItem[];
  likes: string[];
  createdAt: string;
}

const SUBJECT_META: Record<string, { emoji: string; gradient: string; chip: string }> = {
  Mathematics: {
    emoji: '📐',
    gradient: 'from-blue-500/25 via-indigo-500/20 to-transparent',
    chip: 'border-blue-400/30 text-blue-300 bg-blue-500/10',
  },
  Physics: {
    emoji: '⚛️',
    gradient: 'from-purple-500/25 via-violet-500/20 to-transparent',
    chip: 'border-purple-400/30 text-purple-300 bg-purple-500/10',
  },
  Chemistry: {
    emoji: '🧪',
    gradient: 'from-green-500/25 via-emerald-500/20 to-transparent',
    chip: 'border-green-400/30 text-green-300 bg-green-500/10',
  },
  Biology: {
    emoji: '🧬',
    gradient: 'from-emerald-500/25 via-teal-500/20 to-transparent',
    chip: 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10',
  },
  'Computer Science': {
    emoji: '💻',
    gradient: 'from-orange-500/25 via-amber-500/20 to-transparent',
    chip: 'border-orange-400/30 text-orange-300 bg-orange-500/10',
  },
  Other: {
    emoji: '📖',
    gradient: 'from-slate-500/25 via-gray-500/20 to-transparent',
    chip: 'border-slate-400/30 text-slate-300 bg-slate-500/10',
  },
};

const DEFAULT_META = SUBJECT_META.Other;

export function PostCard({
  post,
  onRefresh,
}: {
  post: PostItem;
  onRefresh: () => Promise<void>;
}) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const userId = (session?.user as any)?.id as string | undefined;

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [composing, setComposing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(Boolean(userId && post.likes.includes(userId)));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [expanded, setExpanded] = useState(false);

  const meta = SUBJECT_META[post.subject] || DEFAULT_META;
  const isAuthor = Boolean(userId && post.user?._id === userId);

  const timeAgo = () => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const contentLines = post.content.split('\n').filter((l) => l.trim());
  const shouldTruncate = contentLines.length > 5 || post.content.length > 320;

  const toggleLike = async () => {
    if (!session?.user) {
      toast('Sign in to like posts', 'info');
      return;
    }
    if (liking) return;
    setLiking(true);
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikeCount((c) => Math.max(0, prevLiked ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch {
      setLiked(prevLiked);
      setLikeCount(post.likes.length);
      toast('Could not update like', 'error');
    }
    setLiking(false);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast('Sign in to comment', 'info');
      return;
    }
    const text = commentText.trim();
    if (!text || composing) return;
    setComposing(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      await onRefresh();
      setCommentText('');
      setShowComments(true);
      toast('Comment posted', 'success');
    } catch {
      toast('Could not post comment', 'error');
    }
    setComposing(false);
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast('Post deleted', 'success');
      await onRefresh();
    } catch {
      toast('Could not delete post', 'error');
    }
    setDeleting(false);
  };

  return (
    <TiltCard className="card-surface rounded-2xl overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-60 pointer-events-none`} />
      <div className="relative tilt-inner">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Avatar src={post.user?.image} name={post.user?.name || 'Anonymous'} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">
                  {post.user?.name || 'Anonymous'}
                </span>
                {isAuthor && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--text-muted)]">{timeAgo()}</span>
            </div>
            <span className={`${meta.chip} border text-xs font-semibold rounded-full px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0`}>
              <span>{meta.emoji}</span>
              <span className="hidden sm:inline">{post.subject}</span>
            </span>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words">
            {shouldTruncate && !expanded
              ? contentLines.slice(0, 5).join('\n') + '...'
              : post.content}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-5 pb-4 flex items-center gap-1 border-t border-[var(--border-color)] pt-3">
          <button
            onClick={toggleLike}
            disabled={liking}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Like"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all ${liked ? 'text-rose-400 scale-110 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]' : 'text-[var(--text-secondary)] group-hover:text-rose-300'}`}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className={`text-sm font-medium ${liked ? 'text-rose-300' : 'text-[var(--text-secondary)]'}`}>
              {likeCount}
            </span>
          </button>

          <button
            onClick={() => setShowComments((v) => !v)}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Comments"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-colors ${showComments ? 'text-indigo-300' : 'text-[var(--text-secondary)] group-hover:text-indigo-300'}`}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className={`text-sm font-medium ${showComments ? 'text-indigo-300' : 'text-[var(--text-secondary)]'}`}>
              {post.comments.length}
            </span>
          </button>

          {isAuthor && (
            <button
              onClick={deletePost}
              disabled={deleting}
              className="group ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors text-[var(--text-muted)] hover:text-rose-300"
              aria-label="Delete post"
            >
              {deleting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {showComments && (
          <div className="px-5 pb-5 animate-slide-down">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {post.comments.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-2">No comments yet — be the first to help!</p>
              )}
              {post.comments.map((c) => (
                <div key={c._id} className="flex gap-3 animate-fade-in">
                  <div className="flex-shrink-0">
                    <Avatar src={c.user.image} name={c.user.name} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0 bg-white/[0.04] border border-[var(--border-color)] rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[13px] text-[var(--text-primary)]">{c.user.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {(() => {
                          try {
                            return formatDistanceToNow(new Date(c.createdAt), { addSuffix: true });
                          } catch {
                            return '';
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitComment} className="mt-4 flex gap-2.5">
              <Avatar src={session?.user?.image} name={session?.user?.name || 'User'} size="sm" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-[var(--border-color)] rounded-2xl pl-4 pr-1.5 py-1.5 focus-within:border-indigo-400/50 transition-all">
                <input
                  type="text"
                  placeholder="Write a helpful reply…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 py-1.5 text-sm bg-transparent placeholder:text-[var(--text-muted)]"
                  disabled={composing}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || composing}
                  className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white bg-[linear-gradient(115deg,#6366f1,#8b5cf6)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-[0_6px_16px_-6px_rgba(99,102,241,0.8)]"
                >
                  {composing ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </TiltCard>
  );
}