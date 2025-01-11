import { Link } from '@tanstack/react-router';
import { cloneElement } from 'react';

import { useAppStore } from '../store/react';
import { CoverArt } from './coverArt';
import { Skeleton } from './skeleton';

export function AlbumCard({
  coverArtSizes,
  id,
}: {
  coverArtSizes?: string;
  id?: string;
}) {
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
            className="aspect-square w-full"
            coverArt={album?.coverArt}
            sizes={coverArtSizes}
          />

          <h2 className="text-balance font-bold leading-tight">
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
}
