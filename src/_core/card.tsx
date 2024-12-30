import type { JSX } from 'react';
import { createElement } from 'react';

import { cn } from './cn';

export function Card<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'article',
>({
  as,
  className,
  ...otherProps
}: { [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K] } & {
  as?: T;
}) {
  return createElement(as ?? 'article', {
    className: cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className,
    ),
    ...otherProps,
  });
}

export function CardHeader<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'header',
>({
  as,
  className,
  ...otherProps
}: { [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K] } & {
  as?: T;
}) {
  return createElement(as ?? 'header', {
    className: cn('flex flex-col space-y-1.5 p-6', className),
    ...otherProps,
  });
}

export function CardTitle<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'h2',
>({
  as,
  className,
  ...otherProps
}: { [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K] } & {
  as?: T;
}) {
  return createElement(as ?? 'h2', {
    className: cn('text-2xl font-bold leading-none tracking-tight', className),
    ...otherProps,
  });
}

export function CardDescription<
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
    className: cn('text-sm text-muted-foreground', className),
    ...otherProps,
  });
}

export function CardContent<
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
    className: cn('p-6 pt-0', className),
    ...otherProps,
  });
}

export function CardFooter<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'footer',
>({
  as,
  className,
  ...otherProps
}: { [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K] } & {
  as?: T;
}) {
  return createElement(as ?? 'footer', {
    className: cn('p-6 pt-0', className),
    ...otherProps,
  });
}
