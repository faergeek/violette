import { cn } from './cn';

export function H1({ className, ...otherProps }: React.ComponentProps<'h1'>) {
  return <h1 className={cn('text-4xl font-bold', className)} {...otherProps} />;
}
