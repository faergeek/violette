import type { JSX } from 'react';
import { createElement } from 'react';
import sanitizeHtml from 'sanitize-html';

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
} & SkeletonProps<{
    html: string;
  }>) {
  return skeleton
    ? createElement(
        as ?? 'div',
        { className: 'space-y-2' },
        <>
          <Skeleton className="w-96" />
          <Skeleton className="w-64" />
          <Skeleton className="w-80" />
          <Skeleton className="w-56" />
        </>,
      )
    : createElement(as ?? 'div', {
        className: 'prose max-w-none',

        dangerouslySetInnerHTML: {
          __html: sanitizeHtml(html, {
            allowedAttributes: {
              a: ['href', 'name', 'rel', 'target'],
            },
            allowedTags: ['a'],
            disallowedTagsMode: 'escape',
            transformTags: {
              a: (tagName, attribs) => ({
                tagName,
                attribs: {
                  ...attribs,
                  rel: 'noopener',
                  target: '_blank',
                },
              }),
            },
          }),
        },
      });
}
