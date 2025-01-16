import { Await, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { formatDuration } from '../_core/formatDuration';
import { H1, H2 } from '../_core/headings';
import { MediaHeader } from '../_core/mediaHeader';
import { MediaLinks } from '../_core/mediaLinks';
import { Prose } from '../_core/prose';
import { Skeleton } from '../_core/skeleton';
import { SongList } from '../_core/songList';
import { StarButton } from '../_core/starButton';
import type { AlbumInfo } from '../api/types';
import { StoreConsumer, useAppStore } from '../store/react';

export function getAlbumSongElementId(songId: string) {
  return `song-${songId}`;
}

export function AlbumPage({
  albumId,
  deferredAlbumInfo,
}: {
  albumId: string;
  deferredAlbumInfo?: Promise<AlbumInfo>;
}) {
  const base = useAppStore(state => state.albums.baseById.get(albumId));
  const details = useAppStore(state => state.albums.detailsById.get(albumId));
  const songIds = useAppStore(state => state.albums.songIdsById.get(albumId));

  const songs = useAppStore(
    useShallow(state =>
      songIds?.map(id => state.songs.byId.get(id)).filter(song => song != null),
    ),
  );

  const discs = useMemo(() => {
    if (!details || !songs) return;

    const result: Array<{ number: number; songIds: string[]; title: string }> =
      [];

    for (const song of songs) {
      const discTitle = details.discTitles?.find(
        x => x.disc === song.discNumber,
      );
      const discNumber = song.discNumber ?? 1;

      const disc = (result[discNumber - 1] ??= {
        number: discNumber,
        songIds: [],
        title: discTitle?.title ?? '',
      });

      disc.songIds.push(song.id);
    }

    return result;
  }, [details, songs]);

  function renderAlbumInfo(
    children: (albumInfo: AlbumInfo) => React.ReactNode,
    fallback: React.ReactElement = <></>,
  ) {
    return (
      <StoreConsumer selector={state => state.albums.infoById.get(albumId)}>
        {albumInfo =>
          albumInfo ? (
            children(albumInfo)
          ) : deferredAlbumInfo ? (
            <Await fallback={fallback} promise={deferredAlbumInfo}>
              {info => children(info)}
            </Await>
          ) : (
            fallback
          )
        }
      </StoreConsumer>
    );
  }

  return (
    <>
      <MediaHeader
        coverArt={base?.coverArt}
        links={renderAlbumInfo(
          albumInfo => (
            <MediaLinks
              lastFmUrl={albumInfo.lastFmUrl}
              musicBrainzUrl={
                albumInfo.musicBrainzId
                  ? `https://musicbrainz.org/release/${albumInfo.musicBrainzId}`
                  : undefined
              }
            />
          ),
          <MediaLinks skeleton />,
        )}
      >
        <div className="space-y-2">
          <div>
            <div className="text-sm font-bold tracking-widest text-muted-foreground [font-variant-caps:all-small-caps]">
              Album
            </div>

            <H1>
              {base ? (
                <>
                  <Link params={{ albumId: base.id }} to="/album/$albumId">
                    {base.name}
                  </Link>

                  <StarButton
                    className="ms-2"
                    albumId={base.id}
                    starred={base.starred}
                  />
                </>
              ) : (
                <Skeleton className="w-64" />
              )}
            </H1>

            <div className="text-muted-foreground">
              {base ? (
                <>
                  {base.year != null && <>{base.year} &ndash; </>}
                  <Link
                    params={{ artistId: base.artistId }}
                    to="/artist/$artistId"
                  >
                    {base.artist}
                  </Link>{' '}
                  &ndash; {formatDuration(base.duration)}
                </>
              ) : (
                <Skeleton className="w-40" />
              )}
            </div>
          </div>

          {renderAlbumInfo(
            albumInfo =>
              albumInfo.notes && <Prose as="p" html={albumInfo.notes} />,
            <Prose as="p" skeleton />,
          )}
        </div>
      </MediaHeader>

      {base == null || details == null || discs == null ? (
        <SongList />
      ) : discs.length > 1 ? (
        <div className="space-y-4">
          {discs.map(disc => (
            <div key={disc.number}>
              <H2 className="text-md mb-2 font-semibold text-muted-foreground">
                Disc {disc.number}
                {disc.title && <> - {disc.title}</>}
              </H2>

              <SongList
                getSongElementId={getAlbumSongElementId}
                isAlbumView
                isCompilation={details.isCompilation}
                primaryArtist={base.artist}
                songIds={disc.songIds}
                songIdsToPlay={songIds}
              />
            </div>
          ))}
        </div>
      ) : (
        <SongList
          getSongElementId={getAlbumSongElementId}
          isAlbumView
          isCompilation={details.isCompilation}
          primaryArtist={base.artist}
          songIds={songIds}
        />
      )}
    </>
  );
}
