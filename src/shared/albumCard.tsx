import { Link } from '@tanstack/react-router';

import { useAppStore } from '../store/context.js';
import css from './albumCard.module.css';
import { CoverArt } from './coverArt.js';
import { Skeleton } from './skeleton.js';

export function AlbumCard({
  coverArtSizes,
  id,
  loadCoverArtLazily,
}: {
  coverArtSizes?: string;
  id?: string;
  loadCoverArtLazily?: boolean;
}) {
  const album = useAppStore(state =>
    id == null ? undefined : state.albums.baseById.get(id),
  );

  return (
    <div className={css.root}>
      <Link className={css.link} params={{ albumId: id }} to="/album/$albumId">
        <CoverArt
          coverArt={album?.coverArt}
          lazy={loadCoverArtLazily}
          sizes={coverArtSizes}
        />

        <h2 className={css.name}>
          {album ? album.name : <Skeleton style={{ width: '6rem' }} />}
        </h2>
      </Link>

      <div className={css.info}>
        {album ? (
          <>
            {album.year != null && (
              <>
                <time>{album.year}</time> {' – '}
              </>
            )}

            <Link params={{ artistId: album.artistId }} to="/artist/$artistId">
              {album.artist}
            </Link>
          </>
        ) : (
          <Skeleton style={{ width: '4rem' }} />
        )}
      </div>
    </div>
  );
}
