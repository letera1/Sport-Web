import { useState } from 'react';
import { cn } from '../lib/utils';
import { getProxiedImageUrl } from '../services/sportsApi';

interface TeamBadgeProps {
  name: string;
  badgeUrl?: string | null;
  className?: string;
}

/**
 * Renders the club crest, falling back to an initials monogram.
 * Some providers omit logos from standings payloads, and a generic placeholder
 * icon reads as broken, whereas initials stay legible and on-brand.
 */
export const TeamBadge = ({ name, badgeUrl, className }: TeamBadgeProps) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(badgeUrl) && !failed;

  if (showImage) {
    return (
      <img
        src={getProxiedImageUrl(badgeUrl)}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('object-contain shrink-0', className)}
      />
    );
  }

  const initials = name
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      aria-hidden="true"
      className={cn(
        'shrink-0 rounded-full bg-surface-hover border border-border/60',
        'flex items-center justify-center font-bold text-text-secondary',
        'text-[9px] leading-none select-none',
        className
      )}
    >
      {initials || '?'}
    </span>
  );
};
