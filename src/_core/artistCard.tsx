import { Link } from '@tanstack/react-router';
import { cloneElement } from 'react';

import type { BaseArtist, SubsonicCredentials } from '../api/types';
import { CoverArt } from './coverArt';
import { Skeleton } from './skeleton';
import type { SkeletonProps } from './types';

export function ArtistCard({
  artist,
  credentials,
  skeleton,
}: SkeletonProps<{
  artist: BaseArtist;
  credentials: SubsonicCredentials;
}>) {
  return (
    <article className="space-y-2">
      {cloneElement(
        skeleton ? (
          <span />
        ) : (
          <Link params={{ artistId: artist.id }} to="/artist/$artistId" />
        ),
        {
          className: 'block p-1',
          children: (
            <>
              {skeleton ? (
                <CoverArt className="size-40" skeleton />
              ) : (
                <CoverArt
                  className="aspect-square"
                  coverArt={artist.coverArt}
                  credentials={credentials}
                  size={400}
                />
              )}

              {skeleton ? <Skeleton className="w-40" /> : <p>{artist.name}</p>}
            </>
          ),
        },
      )}
    </article>
  );
}
