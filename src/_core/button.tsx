import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { JSX } from 'react';

import { cn } from './cn';

const variants = cva(
  'inline-flex cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium opacity-50 transition-colors [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 [:where(:enabled,:any-link)&]:cursor-pointer [:where(:enabled,:any-link)&]:opacity-100',
  {
    variants: {
      size: {
        md: 'px-3 py-2',
        icon: 'h-10 w-10',
      },
      variant: {
        primary:
          'bg-primary text-primary-foreground [:where(:enabled,:any-link)&]:hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground [:where(:enabled,:any-link)&]:hover:bg-secondary/80',
        destructive:
          'bg-destructive text-destructive-foreground [:where(:enabled,:any-link)&]:hover:bg-destructive/90',
        outline:
          'border border-input bg-background [:where(:enabled,:any-link)&]:hover:bg-accent [:where(:enabled,:any-link)&]:hover:text-accent-foreground',
        ghost:
          '[:where(:enabled,:any-link)&]:hover:bg-accent [:where(:enabled,:any-link)&]:hover:text-accent-foreground',
        link: 'text-base text-foreground [:where(:enabled,:any-link)&]:hover:text-primary',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  },
);

export function Button<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'button',
>(
  props: {
    [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K];
  } & VariantProps<typeof variants> & {
      as?: T;
      loading?: boolean;
    },
) {
  if (!props.as || props.as === 'button') {
    props = { type: 'button', ...props };
  } else if (typeof props.as === 'string') {
    props = { role: 'button', ...props };
  }

  const {
    as: As = 'button',
    children,
    className,
    loading,
    size,
    variant,
    ...otherProps
  } = props;

  return (
    <As className={cn(variants({ className, size, variant }))} {...otherProps}>
      {loading && (
        <Loader2 className="absolute animate-spin self-center text-primary-foreground" />
      )}

      <span className={cn('contents', { invisible: loading })}>{children}</span>
    </As>
  );
}
