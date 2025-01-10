import { useLayoutEffect } from 'react';

import { SongRow } from './songRow';

interface Props {
  isAlbumView?: boolean;
  isCompilation?: boolean;
  primaryArtist?: string;
  selectedSongId?: string;
  songIds?: string[];
  songIdsToPlay?: string[];
}

export function SongList({
  isAlbumView,
  isCompilation,
  primaryArtist,
  selectedSongId,
  songIds,
  songIdsToPlay = songIds,
}: Props) {
  function getSongElementId(songId: string) {
    return `song-${songId}`;
  }

  useLayoutEffect(() => {
    if (!selectedSongId) return;

    const song = songIds?.find(id => id === selectedSongId);
    if (!song) return;

    const el = document.getElementById(getSongElementId(selectedSongId));
    if (!el) return;

    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selectedSongId, songIds]);

  return (
    <>
      {(songIds == null
        ? new Array<undefined>(5).fill(undefined)
        : songIds
      ).map((songId, index) => (
        <SongRow
          key={songId ?? index}
          elementId={songId ? getSongElementId(songId) : undefined}
          isAlbumView={isAlbumView}
          isCompilation={isCompilation}
          isSelected={
            selectedSongId != null &&
            songId != null &&
            selectedSongId === songId
          }
          primaryArtist={primaryArtist}
          songId={songId}
          songIdsToPlay={songIdsToPlay}
        />
      ))}
    </>
  );
}
