import { useEffect, useState } from 'react';

import { subsonicGetCoverArtUrl } from '../api/subsonic';
import type { SubsonicCredentials } from '../api/types';
import { cn } from './cn';
import { Skeleton } from './skeleton';
import type { SkeletonProps } from './types';

export function CoverArt({
  className,
  coverArt,
  credentials,
  size,
  skeleton,
  ...otherProps
}: Omit<React.ComponentProps<'img'>, 'src'> &
  SkeletonProps<{
    coverArt: string;
    credentials: SubsonicCredentials;
    size?: number;
  }>) {
  const [isReady, setIsReady] = useState(false);

  const src = coverArt
    ? subsonicGetCoverArtUrl(credentials, coverArt, { size })
    : undefined;

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    const controller = new AbortController();

    img.addEventListener(
      'load',
      () => {
        setIsReady(true);
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [src]);

  return skeleton || !isReady ? (
    <Skeleton className={cn('aspect-square h-auto w-full', className)} />
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
