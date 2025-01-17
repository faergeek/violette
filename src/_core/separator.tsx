import { Root } from '@radix-ui/react-separator';
import clsx from 'clsx';

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...otherProps
}: React.ComponentProps<typeof Root>) {
  return (
    <Root
      className={clsx(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      decorative={decorative}
      orientation={orientation}
      {...otherProps}
    />
  );
}
