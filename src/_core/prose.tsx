import type { JSX } from 'react';

import { Skeleton } from './skeleton';
import type { SkeletonProps } from './types';

export function Prose<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'div',
>({
  as,
  html,
  skeleton,
}: { [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K] } & {
  as?: T;
} & SkeletonProps<{ html: string }>) {
  const Component = as ?? 'div';

  if (skeleton) {
    return (
      <Component className="space-y-2">
        <Skeleton className="w-96" />
        <Skeleton className="w-64" />
        <Skeleton className="w-80" />
        <Skeleton className="w-56" />
      </Component>
    );
  }

  return (
    <Component>
      {Array.from(
        new DOMParser().parseFromString(html, 'text/html').body.childNodes,
      ).map(function htmlNodeToReactNode(
        node: ChildNode,
        index: number,
      ): React.ReactNode {
        if (node instanceof HTMLElement) {
          if (node instanceof HTMLAnchorElement) {
            return (
              <a
                key={index}
                className="text-muted-foreground underline underline-offset-2"
                href={node.href}
                rel="noopener"
                target="_blank"
              >
                {node.textContent}
              </a>
            );
          }

          return node.outerHTML;
        }

        if (node instanceof Text) {
          return node.textContent;
        }

        return String(node);
      })}
    </Component>
  );
}
