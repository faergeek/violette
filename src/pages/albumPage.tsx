import { Await, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { getSongElementId } from '../shared/album';
import { Container } from '../shared/container';
import * as Duration from '../shared/duration';
import { H1 } from '../shared/h1';
import { H2 } from '../shared/h2';
import { MediaHeader } from '../shared/mediaHeader';
import { MediaLinks } from '../shared/mediaLinks';
import { Prose } from '../shared/prose';
import { Skeleton } from '../shared/skeleton';
import { SongList } from '../shared/songList';
import { StarButton } from '../shared/starButton';
import { useAppStore } from '../store/context';
import type { AlbumInfo } from '../subsonic';
import css from './albumPage.module.css';

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
    if (details == null || songs == null) return;

    const result: Array<{
      number: number;
      songIds: string[];
      title: string | undefined;
    }> = [];

    for (const song of songs) {
      const discNumber = song.discNumber ?? 1;
      const discTitle = details.discTitles?.find(x => x.disc === discNumber);

      result[discNumber - 1] ??= {
        number: discNumber,
        songIds: [],
        title: discTitle?.title || undefined,
      };

      result[discNumber - 1].songIds.push(song.id);
    }

    return result;
  }, [details, songs]);

  const albumInfo = useAppStore(state => state.albums.infoById.get(albumId));

  function renderAlbumInfo(
    fallback: React.ReactNode,
    children: (info: AlbumInfo) => React.ReactNode,
  ) {
    return albumInfo != null ? (
      children(albumInfo)
    ) : deferredAlbumInfo != null ? (
      <Await fallback={fallback} promise={deferredAlbumInfo}>
        {children}
      </Await>
    ) : (
      fallback
    );
  }

  return (
    <Container className={css.root}>
      <MediaHeader
        coverArt={base?.coverArt}
        links={renderAlbumInfo(<MediaLinks skeleton />, info => (
          <MediaLinks
            lastFmUrl={info.lastFmUrl}
            musicBrainzUrl={
              info.musicBrainzId == null
                ? undefined
                : `https://musicbrainz.org/release/${info.musicBrainzId}`
            }
          />
        ))}
      >
        <div className={css.info}>
          <div>
            <div className={css.tag}>Album</div>

            <H1>
              {base == null ? (
                <Skeleton style={{ width: '16rem' }} />
              ) : (
                <>
                  <Link params={{ albumId: base.id }} to="/album/$albumId">
                    {base.name}
                  </Link>

                  <StarButton
                    albumId={base.id}
                    className={css.starButton}
                    starred={base.starred}
                  />
                </>
              )}
            </H1>

            <div className={css.subtitle}>
              {base == null ? (
                <Skeleton style={{ width: '5rem' }} />
              ) : (
                <>
                  {base.year != null && (
                    <>
                      {base.year}
                      {' – '}
                    </>
                  )}

                  <Link
                    params={{ artistId: base.artistId }}
                    to="/artist/$artistId"
                  >
                    {base.artist}
                  </Link>

                  {' – '}

                  {base.duration != null && Duration.format(base.duration)}
                </>
              )}
            </div>
          </div>

          {renderAlbumInfo(<Prose />, info =>
            info.notes ? <Prose html={info.notes} /> : null,
          )}
        </div>
      </MediaHeader>

      {base == null || details == null || discs == null ? (
        <SongList />
      ) : discs.length > 1 ? (
        <div className={css.discs}>
          {discs.map(disc => (
            <div key={disc.number}>
              <H2 className={css.discTitle}>
                Disc {disc.number}
                {disc.title != null && (
                  <>
                    {' – '}
                    {disc.title}
                  </>
                )}
              </H2>

              <SongList
                getSongElementId={getSongElementId}
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
          getSongElementId={getSongElementId}
          isAlbumView
          isCompilation={details.isCompilation}
          primaryArtist={base.artist}
          songIds={songIds}
        />
      )}
    </Container>
  );
}
