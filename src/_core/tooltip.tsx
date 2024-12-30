import {
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from '@radix-ui/react-tooltip';

import { cn } from './cn';

export function Tooltip({
  children,
  content,
  sideOffset = 4,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  sideOffset?: number | undefined;
}) {
  return (
    <Provider delayDuration={200}>
      <Root>
        <Trigger asChild>{children}</Trigger>

        <Portal>
          <Content
            className={cn(
              'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            )}
            sideOffset={sideOffset}
          >
            {content}
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
}
