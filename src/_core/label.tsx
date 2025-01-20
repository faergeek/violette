import clsx from 'clsx';

export function Label({
  className,
  ...otherProps
}: React.ComponentProps<'label'>) {
  return (
    <label
      className={clsx(
        'block text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...otherProps}
    />
  );
}
