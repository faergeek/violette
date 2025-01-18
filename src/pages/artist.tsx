import { Await, Link, useRouterState } from '@tanstack/react-router';
import { cloneElement } from 'react';

import { AlbumCard } from '../_core/albumCard';
import { ArtistCard } from '../_core/artistCard';
import { CARD_GRID_COVER_ART_SIZES, CardGrid } from '../_core/cardGrid';
import { EmptyState } from '../_core/emptyState';
import { H1, H2 } from '../_core/headings';
import { MediaHeader } from '../_core/mediaHeader';
import { MediaLinks } from '../_core/mediaLinks';
import { Prose } from '../_core/prose';
import { Skeleton } from '../_core/skeleton';
import { SongList } from '../_core/songList';
import { StarButton } from '../_core/starButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../_core/tabs';
import type { ArtistInfo } from '../api/subsonic/types/artistInfo';
import type { BaseArtist } from '../api/subsonic/types/baseArtist';
import { ArtistTab } from '../routes/_layout/artist.$artistId';
import type { SimilarArtist } from '../slices/artists';
import { StoreConsumer, useAppStore } from '../store/react';
import { getAlbumSongElementId } from './album';

export function ArtistPage({
  deferredArtistInfo,
  deferredSimilarArtists,
  deferredTopSongIds,
  initialAlbumIds,
  initialArtist,
  params,
}: {
  deferredArtistInfo?: Promise<Omit<ArtistInfo, 'similarArtist'>>;
  deferredSimilarArtists?: Promise<SimilarArtist[]>;
  deferredTopSongIds?: Promise<string[]>;
  initialAlbumIds?: string[];
  initialArtist?: BaseArtist;
  params: { artistId: string };
}) {
  const tabValue = useRouterState({
    select: state => state.location.hash || 'main',
  });

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
            <div className="text-sm font-bold tracking-widest text-muted-foreground [font-variant-caps:all-small-caps]">
              Artist
            </div>

            <H1>
              {artist ? (
                <>
                  <Link params={{ artistId: artist.id }} to="/artist/$artistId">
                    {artist.name}
                  </Link>

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
                  hash="albums"
                  hashScrollIntoView={{
                    block: 'start',
                    behavior: 'instant',
                  }}
                  params={{ artistId: artist.id }}
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

      <Tabs value={tabValue}>
        <TabsList>
          <TabsTrigger asChild value="main">
            <Link
              hash="main"
              hashScrollIntoView={false}
              params={params}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Main
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value={ArtistTab.TopSongs}>
            <Link
              hash="top-songs"
              hashScrollIntoView={false}
              params={params}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Top songs
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value={ArtistTab.Albums}>
            <Link
              hash="albums"
              hashScrollIntoView={false}
              params={params}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Albums
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value={ArtistTab.SimilarArtists}>
            <Link
              hash="similar-artists"
              hashScrollIntoView={false}
              params={params}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Similar artists
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" id="main" value="main">
          {renderTopSongs(
            data =>
              data.topSongIds.length !== 0 && (
                <TopSongsSection params={params}>
                  <SongList
                    getSongElementId={getAlbumSongElementId}
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
            <H2 className="mb-2">
              {cloneElement(
                artist ? (
                  <Link
                    hash="albums"
                    hashScrollIntoView={{
                      block: 'start',
                      behavior: 'instant',
                    }}
                    params={{ artistId: artist.id }}
                    resetScroll={false}
                    to="/artist/$artistId"
                  />
                ) : (
                  <span />
                ),
                {},
                'Albums',
              )}
            </H2>

            <CardGrid>
              {albumIds
                ? albumIds
                    .toReversed()
                    .slice(0, 6)
                    .map(id => (
                      <AlbumCard
                        key={id}
                        coverArtSizes={CARD_GRID_COVER_ART_SIZES}
                        id={id}
                        loadCoverArtLazily
                      />
                    ))
                : new Array<null>(6)
                    .fill(null)
                    .map((_, i) => <AlbumCard key={i} />)}
            </CardGrid>
          </section>

          {renderSimilarArtists(
            similarArtists => {
              const presentArtists = similarArtists
                .map(x => (x.present ? x.id : null))
                .filter(similarArtist => similarArtist != null);

              return (
                presentArtists.length !== 0 && (
                  <SimilarArtistsSection
                    artistId={params.artistId}
                    presentArtists={presentArtists}
                  />
                )
              );
            },
            <SimilarArtistsSection artistId={params.artistId} />,
          )}
        </TabsContent>

        <TabsContent id="top-songs" value={ArtistTab.TopSongs}>
          {renderTopSongs(
            data =>
              data.topSongIds.length === 0 ? (
                <EmptyState message="No top songs" />
              ) : (
                <SongList
                  getSongElementId={getAlbumSongElementId}
                  primaryArtist={data.artist.name}
                  songIds={data.topSongIds}
                />
              ),
            <SongList />,
          )}
        </TabsContent>

        <TabsContent id="albums" value={ArtistTab.Albums}>
          <CardGrid>
            {albumIds
              ? albumIds
                  .toReversed()
                  .map(id => (
                    <AlbumCard
                      key={id}
                      coverArtSizes={CARD_GRID_COVER_ART_SIZES}
                      id={id}
                      loadCoverArtLazily
                    />
                  ))
              : new Array<null>(12)
                  .fill(null)
                  .map((_, i) => <AlbumCard key={i} />)}
          </CardGrid>
        </TabsContent>

        <TabsContent id="similar-artists" value={ArtistTab.SimilarArtists}>
          {renderSimilarArtists(
            similarArtists => {
              if (similarArtists.length === 0) {
                return <EmptyState message="No similar artists" />;
              }

              const presentArtists = similarArtists
                .map(x => (x.present ? x.id : null))
                .filter(similarArtist => similarArtist != null);

              const notPresentArtists = similarArtists
                .map(x => (x.present ? null : { name: x.name }))
                .filter(similarArtist => similarArtist != null);

              return (
                <div className="space-y-8">
                  {presentArtists.length !== 0 && (
                    <CardGrid>
                      {presentArtists.map(id => (
                        <ArtistCard
                          key={id}
                          coverArtSizes={CARD_GRID_COVER_ART_SIZES}
                          id={id}
                          loadCoverArtLazily
                        />
                      ))}
                    </CardGrid>
                  )}

                  {notPresentArtists.length !== 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      <H2 className="font-bold">Not found in a library:</H2>

                      <ul className="space-y-2 text-balance">
                        {notPresentArtists.map(similarArtist => (
                          <li
                            key={similarArtist.name}
                            className="inline after:text-primary after:content-['_•_'] last:after:content-['']"
                          >
                            <a
                              href={`https://www.last.fm/music/${encodeURIComponent(similarArtist.name)}`}
                              rel="noopener"
                              target="_blank"
                            >
                              {similarArtist.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            },
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
      <H2 className="mb-2">
        <Link
          hash="top-songs"
          hashScrollIntoView={{
            block: 'start',
            behavior: 'instant',
          }}
          params={params}
          resetScroll={false}
          to="/artist/$artistId"
        >
          Top songs
        </Link>
      </H2>

      {children}
    </section>
  );
}

function SimilarArtistsSection({
  artistId,
  presentArtists,
}: {
  artistId: string;
  presentArtists?: string[];
}) {
  return (
    <section>
      <H2 className="mb-2">
        <Link
          hash="similar-artists"
          hashScrollIntoView={{
            block: 'start',
            behavior: 'instant',
          }}
          params={{ artistId }}
          resetScroll={false}
          to="/artist/$artistId"
        >
          Similar artists
        </Link>
      </H2>

      <CardGrid>
        {presentArtists == null
          ? new Array<null>(6).fill(null).map((_, i) => <ArtistCard key={i} />)
          : presentArtists
              .slice(0, 6)
              .map(id => (
                <ArtistCard
                  key={id}
                  coverArtSizes={CARD_GRID_COVER_ART_SIZES}
                  id={id}
                  loadCoverArtLazily
                />
              ))}
      </CardGrid>
    </section>
  );
}
