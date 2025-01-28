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

  return cloneElement(
    artist == null ? (
      <span />
    ) : (
      <Link params={{ artistId: artist.id }} to="/artist/$artistId" />
    ),
    {
      className: 'block space-y-1 group/artist-card',
      children: (
        <>
          <CoverArt
            className="w-full"
            coverArt={artist?.coverArt}
            lazy={loadCoverArtLazily}
            sizes={coverArtSizes}
          />

          <h2 className="font-bold leading-tight group-odd/artist-card:ps-2 group-even/artist-card:pe-2 sm:group-odd/artist-card:ps-0 sm:group-even/artist-card:pe-0">
            {artist == null ? <Skeleton className="w-24" /> : artist.name}
          </h2>
        </>
      ),
    },
  );
});
