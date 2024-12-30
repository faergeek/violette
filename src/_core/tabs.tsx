import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';

import { cn } from './cn';

export const Tabs = Root;

export function TabsList({
  className,
  ...otherProps
}: React.ComponentProps<typeof List>) {
  return (
    <List
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...otherProps}
    />
  );
}

export function TabsTrigger({
  className,
  ...otherProps
}: React.ComponentProps<typeof Trigger>) {
  return (
    <Trigger
      className={cn(
        'focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...otherProps}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof Content>) {
  return (
    <Content
      className={cn(
        'focus-visible:ring-ring mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
}
