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

export const AlbumCard = memo(function AlbumCard({
  coverArtSizes,
  id,
  loadCoverArtLazily,
}: Props) {
  const album = useAppStore(state =>
    id == null ? undefined : state.albums.baseById.get(id),
  );

  return (
    <article>
      {cloneElement(
        album ? (
          <Link
            className="space-y-1"
            params={{ albumId: album.id }}
            to="/album/$albumId"
          />
        ) : (
          <span />
        ),
        {},
        <>
          <CoverArt
            className="aspect-square w-full bg-muted/75"
            coverArt={album?.coverArt}
            lazy={loadCoverArtLazily}
            sizes={coverArtSizes}
          />

          <h2 className="font-bold leading-tight">
            {album == null ? <Skeleton className="w-24" /> : album.name}
          </h2>
        </>,
      )}

      <div className="text-sm text-muted-foreground">
        {album == null ? (
          <Skeleton className="w-16" />
        ) : (
          <>
            {album.year != null && (
              <>
                <time>{album.year}</time> &ndash;{' '}
              </>
            )}

            <Link params={{ artistId: album.artistId }} to="/artist/$artistId">
              {album.artist}
            </Link>
          </>
        )}
      </div>
    </article>
  );
});
