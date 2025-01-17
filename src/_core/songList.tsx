import { memo } from 'react';

import { SongRow } from './songRow';

interface Props {
  getSongElementId?: (songId: string) => string;
  isAlbumView?: boolean;
  isCompilation?: boolean;
  primaryArtist?: string;
  songIds?: string[];
  songIdsToPlay?: string[];
}

export const SongList = memo(function SongList({
  getSongElementId,
  isAlbumView,
  isCompilation,
  primaryArtist,
  songIds,
  songIdsToPlay = songIds,
}: Props) {
  return (
    <>
      {(songIds == null
        ? new Array<undefined>(5).fill(undefined)
        : songIds
      ).map((songId, index) => (
        <SongRow
          key={songId ?? index}
          elementId={songId ? getSongElementId?.(songId) : undefined}
          isAlbumView={isAlbumView}
          isCompilation={isCompilation}
          primaryArtist={primaryArtist}
          songId={songId}
          songIdsToPlay={songIdsToPlay}
        />
      ))}
    </>
  );
});
