import { Link } from '@tanstack/react-router';

import type { BaseAlbum, SubsonicCredentials } from '../api/types';
import { CoverArt } from './coverArt';

export function AlbumCard({
  album,
  credentials,
}: {
  album: BaseAlbum;
  credentials: SubsonicCredentials;
}) {
  return (
    <article className="p-1">
      <Link params={{ albumId: album.id }} to="/album/$albumId">
        <CoverArt
          className="mb-2 aspect-square"
          coverArt={album.coverArt}
          credentials={credentials}
          size={400}
        />

        <h2 className="font-bold">{album.name}</h2>
      </Link>

      <div className="text-sm text-muted-foreground">
        {album.year != null && (
          <>
            <time>{album.year}</time> &ndash;{' '}
          </>
        )}

        <Link params={{ artistId: album.artistId }} to="/artist/$artistId">
          {album.artist}
        </Link>
      </div>
    </article>
  );
}
