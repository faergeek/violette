import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAppStore } from '../store/react';
import { createCoverArtSrcSet } from './createCoverArtSrcSet';

export function CoverArt({
  alt = '',
  className,
  coverArt,
  lazy,
  sizes,
  ...otherProps
}: Omit<
  React.ComponentProps<'img'>,
  'decoding' | 'loading' | 'src' | 'srcset' | 'onError'
> & {
  coverArt?: string;
  lazy?: boolean;
}) {
  const credentials = useAppStore(state => state.auth.credentials);

  const srcSet = useMemo(
    () =>
      coverArt == null || credentials == null
        ? undefined
        : createCoverArtSrcSet({ coverArt, credentials }),
    [coverArt, credentials],
  );

  const [lastLoadedSrc, setLastLoadedSrc] = useState<string>();
  const [isLoaded, setIsLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    setLastLoadedSrc(img.currentSrc || undefined);
    setIsLoaded(img.complete);
  }, []);

  return (
    <span className={clsx('inline-block rounded-md', className)}>
      <img
        {...otherProps}
        ref={imgRef}
        alt={alt}
        className={clsx('size-full overflow-clip object-contain', {
          'opacity-0': !isLoaded || !srcSet,
          'opacity-100': isLoaded && srcSet,
        })}
        decoding={lazy ? 'async' : undefined}
        loading={lazy ? 'lazy' : undefined}
        sizes={sizes}
        src={lastLoadedSrc}
        srcSet={srcSet}
        onError={event => {
          setIsLoaded(false);
          const img = event.currentTarget;

          setTimeout(() => {
            img.src = img.currentSrc;
          }, 3000);
        }}
        onLoad={event => {
          setLastLoadedSrc(event.currentTarget.currentSrc);
          setIsLoaded(event.currentTarget.complete);
        }}
      />
    </span>
  );
}
