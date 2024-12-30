import { cn } from './cn';

export function Skeleton({
  className,
  ...otherProps
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'my-[0.15lh] block h-[0.7lh] animate-pulse rounded-md bg-muted',
        className,
      )}
      {...otherProps}
    />
  );
}
