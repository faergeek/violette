import { Range, Root, Thumb, Track } from '@radix-ui/react-slider';

import { cn } from './cn';

export function Slider({
  className,
  ...otherProps
}: React.ComponentProps<typeof Root>) {
  return (
    <Root
      className={cn(
        'relative flex touch-none select-none items-center data-[orientation=vertical]:flex-col',
        className,
      )}
      {...otherProps}
    >
      <Track className="relative grow overflow-hidden rounded-full bg-secondary data-[orientation=horizontal]:h-2 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-2">
        <Range className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </Track>

      <Thumb className="focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </Root>
  );
}
