import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Badge component — status indicators and category labels.
 *
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="outline">Beta</Badge>
 * <Badge variant="muted">Draft</Badge>
 */

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'text-[0.72rem] font-bold tracking-[0.05em] uppercase',
    'px-3 py-1',
    'rounded-full',
    'transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[rgba(104,67,236,0.08)] text-accent',
          'border border-[rgba(104,67,236,0.20)]',
          'dark:bg-[rgba(104,67,236,0.10)] dark:border-[rgba(104,67,236,0.25)]',
        ],
        success: [
          'bg-[rgba(22,163,74,0.08)] text-(--success)',
          'border border-[rgba(22,163,74,0.20)]',
          'dark:bg-[rgba(34,197,94,0.08)] dark:text-(--success) dark:border-[rgba(34,197,94,0.20)]',
        ],
        warning: [
          'bg-[rgba(217,119,6,0.08)] text-(--warning)',
          'border border-[rgba(217,119,6,0.20)]',
        ],
        destructive: [
          'bg-[rgba(220,38,38,0.08)] text-destructive',
          'border border-[rgba(220,38,38,0.20)]',
        ],
        outline: [
          'bg-transparent text-foreground',
          'border border-border',
        ],
        muted: [
          'bg-muted text-muted-foreground',
          'border border-border',
        ],
        accent: [
          'bg-accent text-white',
          'border border-transparent',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Badge = React.forwardRef(function Badge({ className, variant, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
