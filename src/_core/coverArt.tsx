import { useEffect, useState } from 'react';

import { subsonicGetCoverArtUrl } from '../api/subsonic';
import { useAppStore } from '../store/react';
import { cn } from './cn';
import { Skeleton } from './skeleton';

export function CoverArt({
  className,
  coverArt,
  size,
  ...otherProps
}: Omit<React.ComponentProps<'img'>, 'src'> & {
  coverArt?: string;
  size?: number;
}) {
  const credentials = useAppStore(state => state.auth.credentials);
  const [isReady, setIsReady] = useState(false);

  const src =
    coverArt == null || credentials == null
      ? undefined
      : subsonicGetCoverArtUrl(credentials, coverArt, { size });

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    const controller = new AbortController();

    img.addEventListener(
      'load',
      () => {
        setIsReady(true);
        controller.abort();
      },
      { once: true, signal: controller.signal },
    );

    img.addEventListener(
      'error',
      () => {
        const timeout = setTimeout(() => {
          img.src = src;
        }, 3000);

        controller.signal.addEventListener(
          'abort',
          () => clearTimeout(timeout),
          { once: true, signal: controller.signal },
        );
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [src]);

  return src == null || !isReady ? (
    <Skeleton className={cn('my-0 aspect-square h-auto w-full', className)} />
  ) : (
    <img
      alt=""
      decoding="async"
      loading="lazy"
      {...otherProps}
      className={cn(
        'rounded-md border-none bg-background object-cover shadow-lg',
        className,
      )}
      src={src}
      width={size}
      height={size}
    />
  );
}
