import { cloneElement } from 'react';

import { cn } from './cn';

export function IconButton({
  className,
  icon,
  label,
  type = 'button',
  ...otherProps
}: Omit<React.ComponentProps<'button'>, 'children'> & {
  icon: React.ReactElement<{ className: string }>;
  label?: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-md text-muted-foreground enabled:hover:text-secondary-foreground disabled:opacity-50',
        className,
      )}
      type={type}
      {...otherProps}
    >
      {cloneElement(icon, { className: cn('size-6', icon.props.className) })}
      {label}
    </button>
  );
}
