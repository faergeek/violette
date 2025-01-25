import { Link } from '@tanstack/react-router';
import { cloneElement, memo } from 'react';

import { useAppStore } from '../store/react';
import { CoverArt } from './coverArt';
import { Skeleton } from './skeleton';

interface Props {
  coverArtSizes?: string;
  id?: string;
  loadCoverArtLazily?: boolean;
}

export const ArtistCard = memo(function ArtistCard({
  coverArtSizes,
  id,
  loadCoverArtLazily,
}: Props) {
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
                className="w-full"
                coverArt={artist?.coverArt}
                lazy={loadCoverArtLazily}
                sizes={coverArtSizes}
              />

              <h2 className="font-bold leading-tight">
                {artist == null ? <Skeleton className="w-24" /> : artist.name}
              </h2>
            </>
          ),
        },
      )}
    </article>
  );
});
