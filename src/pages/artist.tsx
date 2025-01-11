import { Await, Link } from '@tanstack/react-router';
import { cloneElement } from 'react';

import { AlbumCard } from '../_core/albumCard';
import { ArtistCard } from '../_core/artistCard';
import { CardGrid } from '../_core/cardGrid';
import { EmptyState } from '../_core/emptyState';
import { H1 } from '../_core/headings';
import { MediaHeader } from '../_core/mediaHeader';
import { MediaLinks } from '../_core/mediaLinks';
import { Prose } from '../_core/prose';
import { Skeleton } from '../_core/skeleton';
import { SongList } from '../_core/songList';
import { StarButton } from '../_core/starButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../_core/tabs';
import type { ArtistInfo, BaseArtist } from '../api/types';
import { ArtistTab } from '../routes/_layout/artist.$artistId';
import type { SimilarArtist } from '../slices/artists';
import { StoreConsumer, useAppStore } from '../store/react';

export function ArtistPage({
  deferredArtistInfo,
  deferredSimilarArtists,
  deferredTopSongIds,
  initialAlbumIds,
  initialArtist,
  params,
  search,
}: {
  deferredArtistInfo?: Promise<Omit<ArtistInfo, 'similarArtist'>>;
  deferredSimilarArtists?: Promise<SimilarArtist[]>;
  deferredTopSongIds?: Promise<string[]>;
  initialAlbumIds?: string[];
  initialArtist?: BaseArtist;
  params: { artistId: string };
  search: { tab?: ArtistTab };
}) {
  const artist = useAppStore(
    state => state.artists.byId.get(params.artistId) ?? initialArtist,
  );

  function renderArtistInfo(
    children: (
      artistInfo: Omit<ArtistInfo, 'similarArtist'>,
    ) => React.ReactNode,
    fallback: React.ReactElement = <></>,
  ) {
    return (
      <StoreConsumer
        selector={state => state.artists.artistInfoById.get(params.artistId)}
      >
        {artistInfo =>
          artistInfo ? (
            children(artistInfo)
          ) : deferredArtistInfo ? (
            <Await fallback={fallback} promise={deferredArtistInfo}>
              {children}
            </Await>
          ) : (
            fallback
          )
        }
      </StoreConsumer>
    );
  }

  function renderSimilarArtists(
    children: (similarArtists: SimilarArtist[]) => React.ReactNode,
    fallback: React.ReactElement = <></>,
  ) {
    return (
      <StoreConsumer
        selector={state =>
          state.artists.similarArtistsById.get(params.artistId)
        }
      >
        {similarArtists =>
          similarArtists ? (
            children(similarArtists)
          ) : deferredSimilarArtists ? (
            <Await fallback={fallback} promise={deferredSimilarArtists}>
              {children}
            </Await>
          ) : (
            fallback
          )
        }
      </StoreConsumer>
    );
  }

  function renderTopSongs(
    children: (data: {
      artist: BaseArtist;
      topSongIds: string[];
    }) => React.ReactNode,
    fallback: React.ReactElement = <></>,
  ) {
    return (
      <StoreConsumer
        selector={state =>
          artist
            ? state.artists.topSongIdsByArtistName.get(artist.name)
            : undefined
        }
      >
        {topSongIds =>
          topSongIds && artist ? (
            children({ artist, topSongIds })
          ) : deferredTopSongIds && artist ? (
            <Await fallback={fallback} promise={deferredTopSongIds}>
              {songIds => children({ artist, topSongIds: songIds })}
            </Await>
          ) : (
            fallback
          )
        }
      </StoreConsumer>
    );
  }

  const albumIds = useAppStore(
    state =>
      state.artists.albumIdsByArtistId.get(params.artistId) ?? initialAlbumIds,
  );

  return (
    <>
      <MediaHeader
        coverArt={artist?.coverArt}
        links={renderArtistInfo(
          artistInfo => (
            <MediaLinks
              lastFmUrl={artistInfo.lastFmUrl}
              musicBrainzUrl={
                artistInfo.musicBrainzId
                  ? `https://musicbrainz.org/artist/${artistInfo.musicBrainzId}`
                  : undefined
              }
            />
          ),
          <MediaLinks skeleton />,
        )}
      >
        <div className="space-y-2">
          <div>
            <div className="text-sm uppercase text-muted-foreground">
              Artist
            </div>

            <H1>
              {artist ? (
                <>
                  {artist.name}
                  <StarButton
                    className="ms-2"
                    artistId={artist.id}
                    starred={artist.starred}
                  />
                </>
              ) : (
                <Skeleton className="w-64" />
              )}
            </H1>

            <div className="text-muted-foreground">
              {artist ? (
                <Link
                  params={{ artistId: artist.id }}
                  search={{ tab: ArtistTab.Albums }}
                  to="/artist/$artistId"
                >
                  {artist.albumCount} albums
                </Link>
              ) : (
                <Skeleton className="w-20" />
              )}
            </div>
          </div>

          {renderArtistInfo(
            details =>
              details.biography && <Prose as="p" html={details.biography} />,
            <Prose as="p" skeleton />,
          )}
        </div>
      </MediaHeader>

      <Tabs value={search.tab ?? ''}>
        <TabsList>
          <TabsTrigger asChild value="">
            <Link params={params} to="/artist/$artistId">
              Main
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value={ArtistTab.TopSongs}>
            <Link
              params={params}
              search={{ tab: ArtistTab.TopSongs }}
              to="/artist/$artistId"
            >
              Top songs
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value={ArtistTab.Albums}>
            <Link
              params={params}
              search={{ tab: ArtistTab.Albums }}
              to="/artist/$artistId"
            >
              Albums
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value={ArtistTab.SimilarArtists}>
            <Link
              params={params}
              search={{ tab: ArtistTab.SimilarArtists }}
              to="/artist/$artistId"
            >
              Similar artists
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="">
          {renderTopSongs(
            data =>
              data.topSongIds.length !== 0 && (
                <TopSongsSection params={params}>
                  <SongList
                    primaryArtist={data.artist.name}
                    songIds={data.topSongIds.slice(0, 5)}
                    songIdsToPlay={data.topSongIds}
                  />
                </TopSongsSection>
              ),
            <TopSongsSection params={params}>
              <SongList />
            </TopSongsSection>,
          )}

          <section>
            <h2 className="mb-2 text-lg font-bold">
              {cloneElement(
                artist ? (
                  <Link
                    params={{ artistId: artist.id }}
                    search={{ tab: ArtistTab.Albums }}
                    to="/artist/$artistId"
                  />
                ) : (
                  <span />
                ),
                {},
                'Albums',
              )}
            </h2>

            <CardGrid>
              {albumIds
                ? albumIds
                    .toReversed()
                    .slice(0, 6)
                    .map(id => <AlbumCard key={id} id={id} />)
                : new Array<null>(6)
                    .fill(null)
                    .map((_, i) => <AlbumCard key={i} />)}
            </CardGrid>
          </section>
        </TabsContent>

        <TabsContent value={ArtistTab.TopSongs}>
          {renderTopSongs(
            data =>
              data.topSongIds.length === 0 ? (
                <EmptyState message="No top songs" />
              ) : (
                <SongList
                  primaryArtist={data.artist.name}
                  songIds={data.topSongIds}
                />
              ),
            <SongList />,
          )}
        </TabsContent>

        <TabsContent value={ArtistTab.Albums}>
          <CardGrid>
            {albumIds
              ? albumIds.toReversed().map(id => <AlbumCard key={id} id={id} />)
              : new Array<null>(12)
                  .fill(null)
                  .map((_, i) => <AlbumCard key={i} />)}
          </CardGrid>
        </TabsContent>

        <TabsContent value={ArtistTab.SimilarArtists}>
          {renderSimilarArtists(
            similarArtists =>
              similarArtists.length === 0 ? (
                <EmptyState message="No similar artists" />
              ) : (
                <>
                  <CardGrid>
                    {similarArtists
                      .map(x => (x.present ? x.id : null))
                      .filter(similarArtist => similarArtist != null)
                      .map(id => (
                        <ArtistCard key={id} id={id} />
                      ))}
                  </CardGrid>

                  <ul className="list-outside list-disc space-y-2 ps-5">
                    {similarArtists
                      .map(x => (x.present ? null : { name: x.name }))
                      .filter(similarArtist => similarArtist != null)
                      .map(similarArtist => (
                        <li key={similarArtist.name}>{similarArtist.name}</li>
                      ))}
                  </ul>
                </>
              ),
            <CardGrid>
              {new Array<null>(12).fill(null).map((_, i) => (
                <ArtistCard key={i} />
              ))}
            </CardGrid>,
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function TopSongsSection({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    artistId: string;
  };
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold">
        <Link
          params={params}
          search={{ tab: ArtistTab.TopSongs }}
          to="/artist/$artistId"
        >
          Top songs
        </Link>
      </h2>

      {children}
    </section>
  );
}
