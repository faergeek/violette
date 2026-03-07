import { Link } from '@tanstack/react-router';

import { useAppStore } from '../store/context.jsx';
import css from './artistCard.module.css';
import { CoverArt } from './coverArt.jsx';
import { Skeleton } from './skeleton';

export function ArtistCard({
  coverArtSizes,
  id,
  loadCoverArtLazily,
}: {
  coverArtSizes?: string;
  id?: string;
  loadCoverArtLazily?: boolean;
}) {
  const artist = useAppStore(state =>
    id == null ? undefined : state.artists.byId.get(id),
  );

  const children = (
    <>
      <CoverArt
        coverArt={artist?.coverArt}
        lazy={loadCoverArtLazily}
        sizes={coverArtSizes}
      />

      <h2 className={css.name}>
        {artist != null ? artist.name : <Skeleton style={{ width: '6rem' }} />}
      </h2>
    </>
  );

  const className = css.root;

  return artist ? (
    <Link
      className={className}
      params={{ artistId: artist.id }}
      to="/artist/$artistId"
    >
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}
