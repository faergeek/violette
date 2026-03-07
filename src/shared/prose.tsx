import { useMemo } from 'react';

import css from './prose.module.css';
import { Skeleton } from './skeleton';

export function Prose({ html }: { html?: string }) {
  const elements = useMemo(() => {
    if (!html) return null;

    const doc = new DOMParser().parseFromString(html, 'text/html');

    return Array.from(doc.body.childNodes).map((node, index) =>
      node instanceof Text ? (
        node.textContent
      ) : node instanceof HTMLAnchorElement ? (
        <a
          key={index}
          className={css.link}
          href={node.href}
          rel="noopener"
          target="_blank"
        >
          {node.textContent}
        </a>
      ) : node instanceof Element ? (
        node.outerHTML
      ) : (
        String(node)
      ),
    );
  }, [html]);

  return (
    <div>
      {elements ?? (
        <>
          <Skeleton className={css.skeletonLine1} />
          <Skeleton className={css.skeletonLine2} />
          <Skeleton className={css.skeletonLine3} />
          <Skeleton className={css.skeletonLine4} />
        </>
      )}
    </div>
  );
}
