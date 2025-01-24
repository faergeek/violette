import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import type { JSX } from 'react';

const variants = cva(
  'inline-flex cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap opacity-50 [&_svg]:shrink-0 [:where(:enabled,:any-link)&]:cursor-pointer [:where(:enabled,:any-link)&]:opacity-100',
  {
    variants: {
      variant: {
        primary:
          'rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground [&_svg]:size-5 [:where(:enabled,:any-link)&]:hover:bg-primary/90',
        icon: 'rounded-sm text-muted-foreground outline-offset-4 [:where(:enabled,:any-link)&]:hover:text-secondary-foreground',
        link: 'rounded-lg px-3 py-2 text-base text-foreground [&_svg]:size-5 [:where(:enabled,:any-link)&]:hover:text-primary',
      },
    },
    defaultVariants: {
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
    variant,
    ...otherProps
  } = props;

  return (
    <As className={clsx(variants({ className, variant }))} {...otherProps}>
      {loading && (
        <Loader2 className="absolute animate-spin self-center text-primary-foreground" />
      )}

      <span className={clsx('contents', { invisible: loading })}>
        {children}
      </span>
    </As>
  );
}
