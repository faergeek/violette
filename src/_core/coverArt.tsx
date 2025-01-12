import { useEffect, useState } from 'react';

import { useAppStore } from '../store/react';
import { cn } from './cn';
import { createCoverArtSrcSet } from './createCoverArtSrcSet';
import { Skeleton } from './skeleton';

export function CoverArt({
  className,
  coverArt,
  sizes,
  ...otherProps
}: Omit<React.ComponentProps<'img'>, 'src'> & {
  coverArt?: string;
}) {
  const credentials = useAppStore(state => state.auth.credentials);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (coverArt == null || credentials == null || !shouldLoad) return;

    const srcSet = createCoverArtSrcSet({ coverArt, credentials });
    const img = new Image();
    const controller = new AbortController();
    const signal = controller.signal;

    img.addEventListener(
      'load',
      () => {
        setSrc(img.currentSrc);
      },
      { signal },
    );

    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    img.addEventListener(
      'error',
      () => {
        retryTimeout = setTimeout(() => {
          img.srcset = srcSet;
        }, 1000);
      },
      { signal },
    );

    if (sizes != null) img.sizes = sizes;

    img.decoding = 'async';
    img.srcset = srcSet;

    return () => {
      img.srcset = '';
      controller.abort();
      clearTimeout(retryTimeout);
    };
  }, [coverArt, credentials, shouldLoad, sizes]);

  return src == null ? (
    <Skeleton
      ref={skeleton => {
        if (!skeleton) return;

        const observer = new IntersectionObserver(entries => {
          setShouldLoad(entries.some(entry => entry.isIntersecting));
        });

        observer.observe(skeleton);

        return () => observer.unobserve(skeleton);
      }}
      className={cn('my-0 aspect-square h-auto w-full', className)}
    />
  ) : (
    <span
      className={cn(
        'relative inline-flex place-content-center place-items-center overflow-clip rounded-md shadow-lg',
        className,
      )}
    >
      <img
        alt=""
        decoding="async"
        loading="lazy"
        {...otherProps}
        className="absolute size-full object-cover blur-sm"
        sizes={sizes}
        src={src}
      />

      <img
        alt=""
        decoding="async"
        loading="lazy"
        {...otherProps}
        className="relative size-full object-contain"
        sizes={sizes}
        src={src}
      />
    </span>
  );
}
