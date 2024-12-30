import { cloneElement } from 'react';

import { cn } from './cn';

export function IconButton({
  className,
  icon,
  label,
  type = 'button',
  ...otherProps
}: React.ComponentProps<'button'> & {
  icon: React.ReactElement<{ className: string }>;
  label?: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 text-muted-foreground enabled:hover:text-secondary-foreground disabled:text-muted',
        className,
      )}
      type="button"
      {...otherProps}
    >
      {cloneElement(icon, { className: cn('size-6', icon.props.className) })}
      {label}
    </button>
  );
}
