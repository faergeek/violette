import { Link } from '@tanstack/react-router';
import { cloneElement } from 'react';

import { useAppStore } from '../store/react';
import { CoverArt } from './coverArt';
import { Skeleton } from './skeleton';

export function ArtistCard({
  coverArtSizes,
  id,
}: {
  coverArtSizes?: string;
  id?: string;
}) {
  const artist = useAppStore(state =>
    id == null ? undefined : state.artists.byId.get(id),
  );

  return (
    <article>
      {cloneElement(
        artist == null ? (
          <span />
        ) : (
          <Link params={{ artistId: artist.id }} to="/artist/$artistId" />
        ),
        {
          className: 'block space-y-1',
          children: (
            <>
              <CoverArt
                className="aspect-square w-full"
                coverArt={artist?.coverArt}
                sizes={coverArtSizes}
              />

              <h2 className="text-balance font-bold leading-tight">
                {artist == null ? <Skeleton className="w-24" /> : artist.name}
              </h2>
            </>
          ),
        },
      )}
    </article>
  );
}
