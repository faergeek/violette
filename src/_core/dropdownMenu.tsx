import {
  Content,
  Item,
  Portal,
  Root,
  Trigger,
} from '@radix-ui/react-dropdown-menu';

import { cn } from './cn';

export const DropdownMenu = Root;
export const DropdownMenuTrigger = Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...otherProps
}: React.ComponentProps<typeof Content>) {
  return (
    <Portal>
      <Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...otherProps}
      />
    </Portal>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  ...otherProps
}: React.ComponentProps<typeof Item> & {
  inset?: boolean;
}) {
  return (
    <Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className,
      )}
      {...otherProps}
    />
  );
}
