import { cn } from './cn';

export function Label({
  className,
  ...otherProps
}: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn(
        'block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...otherProps}
    />
  );
}
