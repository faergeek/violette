import { Indicator, Item, Root } from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';

import { cn } from './cn';

export function RadioGroup({
  className,
  ...otherProps
}: React.ComponentProps<typeof Root>) {
  return <Root className={cn('grid gap-2', className)} {...otherProps} />;
}

export function RadioGroupItem({
  className,
  ...otherProps
}: React.ComponentProps<typeof Item>) {
  return (
    <Item
      className={cn(
        'focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...otherProps}
    >
      <Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </Indicator>
    </Item>
  );
}
