import clsx from 'clsx';

export function H1({ className, ...otherProps }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={clsx('text-4xl font-bold tracking-wide', className)}
      {...otherProps}
    />
  );
}

export function H2({ className, ...otherProps }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={clsx(
        'font-bold tracking-widest [font-variant-caps:all-small-caps]',
        className,
      )}
      {...otherProps}
    />
  );
}
