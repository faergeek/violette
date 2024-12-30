import { Heart } from 'lucide-react';

import { cn } from './cn';

export function StarredIcon({
  className,
  starred,
  ...otherProps
}: React.ComponentProps<typeof Heart> & { starred: string | undefined }) {
  return (
    <Heart
      className={cn(starred ? 'fill-primary stroke-primary' : '', className)}
      {...otherProps}
    />
  );
}
