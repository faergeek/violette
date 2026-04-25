import clsx from 'clsx';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

import { useAppStore } from '../store/context';
import type { Credentials } from '../subsonic';
import { getCoverArt } from '../subsonic';
import css from './coverArt.module.css';

export function createSrcSet(credentials: Credentials, coverArt: string) {
  return [50, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500, 2000]
    .map(size => `${getCoverArt(credentials, coverArt, size)} ${size}w`)
    .join(',');
}

export function preload(
  credentials: Credentials,
  coverArt: string,
  sizes: string,
) {
  const img = new Image();
  img.sizes = sizes;
  img.srcset = createSrcSet(credentials, coverArt);
}

export function CoverArt({
  alt,
  className,
  coverArt,
  lazy,
  sizes,
}: {
  alt?: string;
  className?: string;
  coverArt?: string;
  lazy?: boolean;
  sizes?: string;
}) {
  const credentials = useAppStore(state => state.auth.credentials);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastLoadedSrc, setLastLoadedSrc] = useState<string>();
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const srcSet = useMemo(
    () =>
      coverArt == null || credentials == null
        ? undefined
        : createSrcSet(credentials, coverArt),
    [coverArt, credentials],
  );

  useEffect(() => {
    startTransition(() => {
      setIsLoaded(false);
      setLastLoadedSrc(undefined);
    });
  }, [srcSet]);

  return (
    <div className={clsx(className, css.root)}>
      <img
        ref={imgRef}
        alt={alt}
        className={clsx(css.img, {
          [css.img_not_loaded]:
            !isLoaded || coverArt == null || credentials == null,
        })}
        decoding={lazy ? 'async' : undefined}
        loading={lazy ? 'lazy' : undefined}
        sizes={sizes}
        src={lastLoadedSrc}
        srcSet={srcSet}
        onError={event => {
          const img = event.currentTarget;
          setIsLoaded(false);

          retryTimeoutRef.current ??= setTimeout(() => {
            retryTimeoutRef.current = undefined;
            img.src = img.currentSrc;
          }, 3000);
        }}
        onLoad={event => {
          setIsLoaded(event.currentTarget.complete);
          setLastLoadedSrc(event.currentTarget.currentSrc);
        }}
      />
    </div>
  );
}
