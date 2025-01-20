import type { Placement } from '@floating-ui/dom';
import clsx from 'clsx';

import { Popover, PopoverContent, PopoverReference } from './popover';

export const DropdownMenu = Popover;
export const DropdownMenuReference = PopoverReference;

export function DropdownMenuContent({
  placement,
  ...otherProps
}: React.ComponentProps<'div'> & {
  placement?: Placement | undefined;
}) {
  return (
    <PopoverContent offsetOptions={{ mainAxis: 4 }} placement={placement}>
      <div
        {...otherProps}
        className="m-0 origin-top-right rounded-md border bg-background p-1 shadow-md [&:popover-open]:animate-in [&:popover-open]:fade-in-0 [&:popover-open]:zoom-in-95 [&:popover-open]:slide-in-from-top-2"
        popover="auto"
        role="menu"
      />
    </PopoverContent>
  );
}

export function DropdownMenuItem({
  className,
  ...otherProps
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={clsx(
        'flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      role="menuitem"
      type="button"
      {...otherProps}
    />
  );
}
