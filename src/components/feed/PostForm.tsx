'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';

const SUBJECTS = [
  { value: 'Mathematics', label: '📐 Mathematics' },
  { value: 'Physics', label: '⚛️ Physics' },
  { value: 'Chemistry', label: '🧪 Chemistry' },
  { value: 'Biology', label: '🧬 Biology' },
  { value: 'Computer Science', label: '💻 Computer Science' },
  { value: 'Other', label: '📖 Other' },
];

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: string, content: string) => Promise<void>;
}

export function PostForm({ isOpen, onClose, onSubmit }: PostFormProps) {
  const { data: session } = useSession();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; content?: string }>({});

  const validate = () => {
    const next: { subject?: string; content?: string } = {};
    if (!subject) next.subject = 'Pick a subject so others can find your doubt';
    if (!content.trim()) next.content = 'Write your doubt or question';
    else if (content.trim().length < 8) next.content = 'Add at least 8 characters';
    else if (content.trim().length > 5000) next.content = 'Keep it under 5000 characters';
    setErrors(next);
    return !next.subject && !next.content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    await onSubmit(subject, content.trim());
    setSubmitting(false);
    setSubject('');
    setContent('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share a doubt"
      description="Ask the community — someone out there knows the answer."
      size="lg"
      closeOnOverlayClick={!submitting}
      showCloseButton={!submitting}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-[var(--border-color)]">
          <Avatar src={session?.user?.image || undefined} name={session?.user?.name || 'User'} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] text-sm">Posting as</p>
            <p className="text-sm text-[var(--text-secondary)] truncate">{session?.user?.name || 'You'}</p>
          </div>
        </div>

        <Select
          label="Subject"
          placeholder="Choose a subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={SUBJECTS}
          error={errors.subject}
          className="w-full"
        />

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Your doubt
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe what you're stuck on, what you've already tried, and any context that would help a classmate answer…"
            rows={6}
            className={`w-full px-4 py-3 text-base min-h-[140px] resize-y bg-[var(--bg-card)] border rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
              errors.content
                ? 'border-[var(--accent-error)] focus:ring-[var(--accent-error)]'
                : 'border-[var(--border-color)] hover:border-[var(--border-light)] focus:ring-indigo-400'
            }`}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {errors.content ? (
              <p className="text-sm text-[var(--accent-error)]">{errors.content}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${content.length > 4800 ? 'text-amber-300' : 'text-[var(--text-muted)]'}`}>
              {content.length}/5000
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} size="lg">
            Post question
          </Button>
        </div>
      </form>
    </Modal>
  );
}