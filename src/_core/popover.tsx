import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-popover';

import { cn } from './cn';

export const Popover = Root;
export const PopoverTrigger = Trigger;

export function PopoverContent({
  className,
  sideOffset = 4,
  ...otherProps
}: React.ComponentProps<typeof Content>) {
  return (
    <Portal>
      <Content
        className={cn(
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        sideOffset={sideOffset}
        {...otherProps}
      />
    </Portal>
  );
}

export function PopoverArrow({
  className,
  ...otherProps
}: React.ComponentProps<typeof Arrow>) {
  return (
    <Arrow
      className={cn('-mt-[1px] fill-background drop-shadow-md', className)}
      {...otherProps}
    />
  );
}
