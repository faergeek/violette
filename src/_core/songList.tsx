import clsx from 'clsx';
import { memo } from 'react';

import { SongRow } from './songRow';

interface Props {
  getSongElementId?: (songId: string) => string;
  isAlbumView?: boolean;
  isCompilation?: boolean;
  isQueueView?: boolean;
  primaryArtist?: string;
  songIds?: string[];
  songIdsToPlay?: string[];
}

export const SongList = memo(function SongList({
  getSongElementId,
  isAlbumView,
  isCompilation,
  isQueueView,
  primaryArtist,
  songIds,
  songIdsToPlay = songIds,
}: Props) {
  return (
    <div
      className={clsx(
        'grid text-sm [grid-template-columns:auto_1fr_auto_minmax(32px,auto)_auto]',
        {
          'gap-x-1': isAlbumView,
          'gap-x-2': !isAlbumView,
        },
      )}
    >
      {(songIds == null
        ? new Array<undefined>(5).fill(undefined)
        : songIds
      ).map((songId, index) => (
        <SongRow
          key={songId ?? index}
          elementId={songId ? getSongElementId?.(songId) : undefined}
          isAlbumView={isAlbumView}
          isCompilation={isCompilation}
          isQueueView={isQueueView}
          primaryArtist={primaryArtist}
          songId={songId}
          songIdsToPlay={songIdsToPlay}
        />
      ))}
    </div>
  );
});
