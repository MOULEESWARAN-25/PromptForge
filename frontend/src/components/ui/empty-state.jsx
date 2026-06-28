import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * EmptyState — illustrated empty content placeholder with CTA.
 *
 * @example
 * <EmptyState
 *   icon={<FileText size={32} />}
 *   title="No prompts yet"
 *   description="Create your first prompt to get started."
 *   action={<Button onClick={onCreate}>Create Prompt</Button>}
 * />
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'px-(--space-xl) py-(--space-2xl)',
        'gap-(--space-md)',
        className,
      )}
    >
      {icon && (
        <div className={cn(
          'flex items-center justify-center',
          'w-16 h-16 rounded-lg',
          'bg-muted text-muted-foreground',
          'mb-(--space-sm)',
        )}>
          {icon}
        </div>
      )}

      {title && (
        <h3 className="text-base font-semibold text-foreground tracking-[-0.01em]">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-(--space-sm)">
          {action}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
