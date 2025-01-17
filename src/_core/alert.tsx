import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export function Alert({
  className,
  variant,
  ...otherProps
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={clsx(alertVariants({ variant }), className)}
      role="alert"
      {...otherProps}
    />
  );
}

export function AlertTitle({
  className,
  ...otherProps
}: React.ComponentProps<'h5'>) {
  return (
    <h5
      className={clsx(
        'mb-1 font-medium leading-none tracking-tight',
        className,
      )}
      {...otherProps}
    />
  );
}

export function AlertDescription({
  className,
  ...otherProps
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx('text-sm [&_p]:leading-relaxed', className)}
      {...otherProps}
    />
  );
}
