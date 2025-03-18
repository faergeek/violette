import clsx from 'clsx';

export function Skeleton({
  className,
  ...otherProps
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={clsx(
        'my-[0.25lh] block h-[0.75lh] animate-pulse rounded-md bg-muted',
        className,
      )}
      {...otherProps}
    />
  );
}
