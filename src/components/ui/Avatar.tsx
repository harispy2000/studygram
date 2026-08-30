'use client';
import { ImgHTMLAttributes, forwardRef } from 'react';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-xl',
};

const statusColors = {
  online: 'bg-[var(--accent-primary)]',
  offline: 'bg-[var(--text-muted)]',
  busy: 'bg-[var(--accent-error)]',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-cyan-500', 'bg-violet-500', 'bg-orange-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, name, size = 'md', shape = 'circle', status, className = '', ...props }, ref) => {
    const hasImage = src && src.length > 0;
    const initials = name ? getInitials(name) : '?';
    const bgColor = name ? getColorFromName(name) : 'bg-[var(--border-light)]';

    return (
      <div className={`relative inline-flex ${className}`}>
        {hasImage ? (
          <img
            ref={ref}
            src={src}
            alt={alt || name || 'Avatar'}
            className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover ${status ? 'ring-2 ring-[var(--bg-primary)]' : ''}`}
            {...props}
          />
        ) : (
          <div
            ref={ref}
            className={`${sizeClasses[size]} ${shapeClasses[shape]} ${bgColor} flex items-center justify-center font-medium text-white select-none`}
            aria-label={name || 'User avatar'}
            {...props}
          >
            {initials}
          </div>
        )}
        {status && (
          <span
            className={`
              absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]}
              ${shape === 'circle' ? 'rounded-full' : 'rounded'} 
              ring-2 ring-[var(--bg-primary)]
              animate-pulse
            `}
            aria-label={`${status} status`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export function AvatarGroup({ 
  avatars = [], 
  max = 4, 
  size = 'md',
  className = '' 
}: { 
  avatars: (AvatarProps & { key: string })[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} aria-label={`${avatars.length} people`}>
      {visible.map((avatar) => {
        const { key, ...rest } = avatar;
        return <Avatar key={key} {...rest} size={size} className="relative z-[auto]" />;
      })}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} ${shapeClasses.circle} bg-[var(--bg-tertiary)] border-2 border-[var(--bg-primary)] flex items-center justify-center font-medium text-[var(--text-secondary)]`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}