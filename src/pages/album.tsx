import { Await, getRouteApi, Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { formatDuration } from '../_core/formatDuration';
import { H1 } from '../_core/headings';
import { MediaHeader } from '../_core/mediaHeader';
import { MediaLinks } from '../_core/mediaLinks';
import { Prose } from '../_core/prose';
import { SongList } from '../_core/songList';
import { StarButton } from '../_core/starButton';
import type { BaseSong } from '../api/types';

export function Album() {
  const routeApi = getRouteApi('/_layout/album/$albumId');
  const search = routeApi.useSearch();

  const { album, credentials, deferredAlbumInfo } = routeApi.useLoaderData();

  const year = album.releaseDate?.year;

  const discs = useMemo(() => {
    const result: Array<{
      number: number;
      songs: BaseSong[];
      title: string;
    }> = [];

    for (const song of album.song) {
      const discTitle = album.discTitles?.find(x => x.disc === song.discNumber);
      const discNumber = song.discNumber ?? 1;

      const disc = (result[discNumber - 1] ??= {
        number: discNumber,
        songs: [],
        title: discTitle?.title ?? '',
      });

      disc.songs.push(song);
    }

    return result;
  }, [album.discTitles, album.song]);

  return (
    <article>
      <MediaHeader
        coverArt={album.coverArt}
        credentials={credentials}
        links={
          <Await fallback={<MediaLinks skeleton />} promise={deferredAlbumInfo}>
            {info => (
              <MediaLinks
                lastFmUrl={info.lastFmUrl}
                musicBrainzUrl={
                  info.musicBrainzId
                    ? `https://musicbrainz.org/release/${info.musicBrainzId}`
                    : undefined
                }
              />
            )}
          </Await>
        }
      >
        <div className="space-y-2">
          <div>
            <div className="text-sm uppercase text-muted-foreground">Album</div>

            <H1>
              {album.name}
              <StarButton
                className="ms-2"
                albumId={album.id}
                starred={album.starred}
              />
            </H1>

            <div className="text-muted-foreground">
              {year != null && <>{year} &ndash; </>}
              <Link
                params={{ artistId: album.artistId }}
                to="/artist/$artistId"
              >
                {album.artist}
              </Link>{' '}
              &ndash; {formatDuration(album.duration)}
            </div>
          </div>

          <Await
            fallback={<Prose as="p" skeleton />}
            promise={deferredAlbumInfo}
          >
            {details => details.notes && <Prose as="p" html={details.notes} />}
          </Await>
        </div>
      </MediaHeader>

      {discs.length > 1 ? (
        <div className="space-y-4">
          {discs.map(disc => (
            <div key={disc.number} className="space-y-2">
              <h2 className="text-md font-semibold text-muted-foreground">
                Disc {disc.number}
                {disc.title && <> - {disc.title}</>}
              </h2>

              <SongList
                credentials={credentials}
                isAlbumView
                isCompilation={album.isCompilation}
                primaryArtist={album.artist}
                selectedSongId={search.song}
                songs={disc.songs}
                songsToPlay={album.song}
              />
            </div>
          ))}
        </div>
      ) : (
        <SongList
          credentials={credentials}
          isAlbumView
          isCompilation={album.isCompilation}
          primaryArtist={album.artist}
          selectedSongId={search.song}
          songs={album.song}
        />
      )}
    </article>
  );
}
