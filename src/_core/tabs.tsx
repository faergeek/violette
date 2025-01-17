import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';
import clsx from 'clsx';

export const Tabs = Root;

export function TabsList({
  className,
  ...otherProps
}: React.ComponentProps<typeof List>) {
  return (
    <div className="overflow-auto">
      <List
        className={clsx(
          'inline-flex items-center justify-center space-x-2 p-1 text-sm font-bold text-muted-foreground',
          className,
        )}
        {...otherProps}
      />
    </div>
  );
}

export function TabsTrigger({
  className,
  ...otherProps
}: React.ComponentProps<typeof Trigger>) {
  return (
    <Trigger
      className={clsx(
        'whitespace-nowrap border-b-2 border-transparent p-1 tracking-widest transition-colors [font-variant-caps:all-small-caps] data-[state=active]:border-primary data-[state=active]:text-foreground',
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
  return <Content className={clsx('mt-2', className)} {...props} />;
}
