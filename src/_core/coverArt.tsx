import clsx from 'clsx';
import { useMemo } from 'react';

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

  return (
    <img
      {...otherProps}
      alt={alt}
      className={clsx('rounded-md object-contain', className)}
      decoding={lazy ? 'async' : undefined}
      loading={lazy ? 'lazy' : undefined}
      sizes={sizes}
      srcSet={srcSet}
      onError={event => {
        const img = event.currentTarget;

        setTimeout(() => {
          img.src = img.currentSrc;
        }, 3000);
      }}
    />
  );
}
