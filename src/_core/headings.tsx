import { cn } from './cn';

export function H1({ className, ...otherProps }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn('text-4xl font-bold tracking-wide', className)}
      {...otherProps}
    />
  );
}

export function H2({ className, ...otherProps }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'font-bold tracking-widest [font-variant-caps:all-small-caps]',
        className,
      )}
      {...otherProps}
    />
  );
}
