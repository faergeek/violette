import type { JSX } from 'react';
import { createElement } from 'react';

import { cn } from './cn';

export function CardGrid<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'div',
>({
  as,
  className,
  ...otherProps
}: { [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K] } & {
  as?: T;
}) {
  return createElement(as ?? 'div', {
    className: cn(
      'grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8',
      className,
    ),
    ...otherProps,
  });
}
