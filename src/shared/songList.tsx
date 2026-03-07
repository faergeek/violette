import clsx from 'clsx';

import css from './songList.module.css';
import { SongRow } from './songRow';

export function SongList({
  getSongElementId,
  isAlbumView = false,
  isCompilation = false,
  isQueueView = false,
  primaryArtist,
  songIds,
  songIdsToPlay = songIds,
}: {
  getSongElementId?: (songId: string) => string;
  isAlbumView?: boolean;
  isCompilation?: boolean;
  isQueueView?: boolean;
  primaryArtist?: string;
  songIds?: string[];
  songIdsToPlay?: string[];
}) {
  return (
    <div
      className={clsx(css.root, {
        [css.root_albumView]: isAlbumView,
      })}
    >
      {(songIds ?? Array.from({ length: 5 }, () => undefined)).map(
        (songId, index) => (
          <SongRow
            key={songId ?? index}
            isAlbumView={isAlbumView}
            isCompilation={isCompilation}
            isQueueView={isQueueView}
            songId={songId}
            songIdsToPlay={songIdsToPlay}
            primaryArtist={primaryArtist}
            elementId={
              songId == null || getSongElementId == null
                ? undefined
                : getSongElementId(songId)
            }
          />
        ),
      )}
    </div>
  );
}
