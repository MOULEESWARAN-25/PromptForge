import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Select component — accessible dropdown built on Radix UI Select.
 * Keyboard navigable, ARIA compliant, focus-managed.
 *
 * @example
 * <Select value={val} onValueChange={setVal}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Choose model..." />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="gemini">Gemini</SelectItem>
 *     <SelectItem value="groq">Groq</SelectItem>
 *   </SelectContent>
 * </Select>
 */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex items-center justify-between gap-2',
        'w-full px-[0.85rem] py-2',
        'bg-card text-foreground',
        'border border-border',
        'rounded-md',
        'text-[0.875rem] font-medium',
        'cursor-pointer outline-none',
        'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:border-muted-foreground',
        'focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-glow)]',
        'data-placeholder:text-muted-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        className,
      )}
      {...props}
    >
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {children}
      </span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className="text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(function SelectContent(
  { className, children, position = 'popper', ...props },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={5}
        className={cn(
          'relative z-9999 min-w-32 overflow-hidden',
          'bg-(--popover)',
          'backdrop-blur-xl',
          'border border-border',
          'rounded-md',
          'shadow-(--shadow-lg)',
          'p-1',
          'animate-scale-in',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-4 text-accent text-xs">
          ▲
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-4 text-accent text-xs">
          ▼
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center justify-between',
        'rounded-[6px] px-[0.65rem] py-[0.45rem]',
        'text-[0.8rem] font-medium text-foreground',
        'outline-none',
        'transition-colors duration-150',
        'hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:text-accent',
        'focus:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] focus:text-accent',
        'data-[state=checked]:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] data-[state=checked]:text-accent data-[state=checked]:font-semibold',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check size={12} strokeWidth={2.5} className="text-accent shrink-0" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
