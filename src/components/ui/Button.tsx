'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warm';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-2xl transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
      disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none
      active:translate-y-px active:scale-[0.98]
      select-none
    `;

    const variants = {
      primary: `
        text-white
        bg-[linear-gradient(115deg,#6366f1,#8b5cf6_50%,#06b6d4)]
        bg-[length:180%_auto] bg-left
        hover:bg-right
        shadow-[0_10px_30px_-8px_rgba(99,102,241,0.65)]
        hover:shadow-[0_14px_38px_-8px_rgba(139,92,246,0.75)]
        focus-visible:ring-indigo-400
        transition-[background-position,transform,box-shadow]
        duration-300
      `,
      secondary: `
        bg-transparent text-[var(--text-primary)]
        border border-[var(--border-light)]
        hover:border-indigo-300/50 hover:bg-indigo-500/10
        focus-visible:ring-indigo-400
      `,
      outline: `
        bg-[var(--bg-card)]/60 text-[var(--text-primary)]
        border border-[var(--border-color)]
        hover:border-indigo-300/60 hover:bg-[var(--bg-card-hover)] hover:shadow-[var(--shadow-glow)]
        focus-visible:ring-indigo-400
      `,
      ghost: `
        bg-transparent text-[var(--text-secondary)]
        hover:bg-white/5 hover:text-[var(--text-primary)]
        focus-visible:ring-[var(--border-light)]
      `,
      danger: `
        text-white
        bg-[linear-gradient(115deg,#f43f5e,#dc2626)]
        shadow-[0_10px_28px_-10px_rgba(244,63,94,0.6)]
        focus-visible:ring-rose-400
      `,
      warm: `
        text-[#1a1206]
        bg-[linear-gradient(115deg,#fbbf24,#f59e0b)]
        shadow-[0_10px_28px_-10px_rgba(245,158,11,0.6)]
        focus-visible:ring-amber-400
      `,
    };

    const sizes = {
      sm: 'px-3.5 py-2 text-sm gap-1.5 rounded-xl',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';