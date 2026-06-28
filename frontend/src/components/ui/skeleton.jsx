import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Skeleton — shimmer loading placeholder.
 *
 * @example
 * <Skeleton className="h-4 w-48" />
 * <Skeleton className="h-24 w-full rounded-lg" />
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn(
        'relative overflow-hidden',
        'rounded-md',
        'bg-muted',
        'dark:bg-[rgba(255,255,255,0.05)]',
        // Shimmer overlay
        'after:absolute after:inset-0',
        'after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.04)] after:to-transparent',
        'dark:after:via-[rgba(255,255,255,0.08)]',
        'after:-translate-x-full after:animate-[composited-shimmer_1.4s_infinite]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * SkeletonText — multi-line text placeholder block.
 *
 * @example
 * <SkeletonText lines={3} />
 */
function SkeletonText({ lines = 1, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard — full card loading placeholder.
 */
function SkeletonCard({ className }) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-(--space-lg)',
      'flex flex-col gap-(--space-sm)',
      className,
    )}>
      <Skeleton className="h-5 w-1/2" />
      <SkeletonText lines={3} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };
