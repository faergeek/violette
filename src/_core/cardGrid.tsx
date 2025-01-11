import type { JSX } from 'react';
import { createElement } from 'react';

import { cn } from './cn';

export const CARD_GRID_COVER_ART_SIZES =
  '(max-width: 639px) calc(50vw - 22px), (max-width: 767px) 143px, (max-width: 1023px) 137.6px, (max-width: 1279px) 155.333px, (max-width: 1535px) 168px, 177.5px';

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
