import { Await, Link, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';

import { getSongElementId } from '../shared/album';
import { AlbumCard } from '../shared/albumCard';
import { ArtistCard } from '../shared/artistCard';
import { card_grid_cover_art_sizes, CardGrid } from '../shared/cardGrid';
import { Container } from '../shared/container';
import { EmptyState } from '../shared/emptyState';
import { H1 } from '../shared/h1';
import { H2 } from '../shared/h2';
import { MediaHeader } from '../shared/mediaHeader';
import { MediaLinks } from '../shared/mediaLinks';
import { Prose } from '../shared/prose';
import { Skeleton } from '../shared/skeleton';
import { SongList } from '../shared/songList';
import { StarButton } from '../shared/starButton';
import * as Tabs from '../shared/tabs';
import * as Store from '../store/context';
import { useAppStore } from '../store/context';
import type {
  ArtistInfoWithoutSimilarArtist,
  BaseArtist,
  SimilarArtist,
} from '../subsonic';
import css from './artistPage.module.css';

interface Params {
  artistId: string;
}

function TopSongsSection({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  return (
    <section>
      <H2 className={css.mainTabSectionHeading}>
        <Link
          hash="top-songs"
          hashScrollIntoView={{ behavior: 'instant', block: 'start' }}
          params={{ artistId: params.artistId }}
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
      <H2 className={css.mainTabSectionHeading}>
        <Link
          hash="similar-artists"
          hashScrollIntoView={{ behavior: 'instant', block: 'start' }}
          params={{ artistId }}
          resetScroll={false}
          to="/artist/$artistId"
        >
          Similar artists
        </Link>
      </H2>

      <CardGrid>
        {presentArtists
          ? presentArtists
              .slice(0, 6)
              .map(id => (
                <ArtistCard
                  key={id}
                  coverArtSizes={card_grid_cover_art_sizes}
                  id={id}
                  loadCoverArtLazily
                />
              ))
          : Array.from({ length: 6 }, (_, i) => <ArtistCard key={i} />)}
      </CardGrid>
    </section>
  );
}

export function ArtistPage({
  deferredArtistInfo,
  deferredSimilarArtists,
  deferredTopSongIds,
  initialAlbumIds,
  initialArtist,
  params,
}: {
  deferredArtistInfo?: Promise<ArtistInfoWithoutSimilarArtist>;
  deferredSimilarArtists?: Promise<
    Array<
      | { TAG: 0; _0: Extract<SimilarArtist, { id: unknown }> }
      | { TAG: 1; _0: Exclude<SimilarArtist, { id: unknown }> }
    >
  >;
  deferredTopSongIds?: Promise<string[]>;
  initialAlbumIds?: string[];
  initialArtist?: BaseArtist;
  params: Params;
}) {
  const tabValue = useRouterState({
    select: state =>
      state.location.hash === '' ? 'main' : state.location.hash,
  });

  const artist = useAppStore(
    state => state.artists.byId.get(params.artistId) ?? initialArtist,
  );

  function renderArtistInfo(
    fallback = <></>,
    children: (artistInfo: ArtistInfoWithoutSimilarArtist) => React.ReactNode,
  ) {
    return (
      <Store.Consumer
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
      </Store.Consumer>
    );
  }

  function renderSimilarArtists(
    fallback = <></>,
    children: (
      similarArtists: Array<
        | { TAG: 0; _0: Extract<SimilarArtist, { id: unknown }> }
        | { TAG: 1; _0: Exclude<SimilarArtist, { id: unknown }> }
      >,
    ) => React.ReactNode,
  ) {
    return (
      <Store.Consumer
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
      </Store.Consumer>
    );
  }

  function renderTopSongs(
    fallback = <></>,
    children: (artist: BaseArtist, topSongIds: string[]) => React.ReactNode,
  ) {
    return (
      <Store.Consumer
        selector={state =>
          artist
            ? state.artists.topSongIdsByArtistName.get(artist.name)
            : undefined
        }
      >
        {topSongIds =>
          artist && topSongIds ? (
            children(artist, topSongIds)
          ) : artist && deferredTopSongIds ? (
            <Await fallback={fallback} promise={deferredTopSongIds}>
              {songIds => children(artist, songIds)}
            </Await>
          ) : (
            fallback
          )
        }
      </Store.Consumer>
    );
  }

  const albumIds = useAppStore(
    state =>
      state.artists.albumIdsByArtistId.get(params.artistId) ?? initialAlbumIds,
  );

  return (
    <Container className={css.root}>
      <MediaHeader
        coverArt={artist?.coverArt}
        links={renderArtistInfo(<MediaLinks skeleton />, artistInfo => (
          <MediaLinks
            lastFmUrl={artistInfo.lastFmUrl}
            musicBrainzUrl={
              artistInfo.musicBrainzId == null
                ? undefined
                : `https://musicbrainz.org/artist/${artistInfo.musicBrainzId}`
            }
          />
        ))}
      >
        <div className={css.artistInfo}>
          <div>
            <div className={css.tag}>Artist</div>

            {artist ? (
              <H1>
                <Link
                  params={{ artistId: params.artistId }}
                  to="/artist/$artistId"
                >
                  {artist.name}
                </Link>

                <StarButton
                  artistId={artist.id}
                  className={css.starButton}
                  starred={artist.starred}
                />
              </H1>
            ) : (
              <H1>
                <Skeleton style={{ width: '16rem' }} />
              </H1>
            )}

            <div className={css.subtitle}>
              {artist ? (
                <Link
                  hash="albums"
                  hashScrollIntoView={{ behavior: 'instant', block: 'start' }}
                  params={{ artistId: params.artistId }}
                  to="/artist/$artistId"
                >
                  {artist.albumCount} albums
                </Link>
              ) : (
                <Skeleton style={{ width: '5rem' }} />
              )}
            </div>
          </div>

          {renderArtistInfo(<Prose />, details =>
            details.biography ? <Prose html={details.biography} /> : null,
          )}
        </div>
      </MediaHeader>

      <Tabs.Root value={tabValue}>
        <Tabs.List
          className={clsx(css.tabsList, {
            [css.tabsList_sticky]: tabValue !== 'main',
          })}
        >
          <Tabs.Trigger value="main">
            <Link
              hash="main"
              hashScrollIntoView={{ behavior: 'instant', block: 'nearest' }}
              params={{ artistId: params.artistId }}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Main
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="top-songs">
            <Link
              hash="top-songs"
              hashScrollIntoView={{ behavior: 'instant', block: 'nearest' }}
              params={{ artistId: params.artistId }}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Top songs
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="albums">
            <Link
              hash="albums"
              hashScrollIntoView={{ behavior: 'instant', block: 'nearest' }}
              params={{ artistId: params.artistId }}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Albums
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="similar-artists">
            <Link
              hash="similar-artists"
              hashScrollIntoView={{ behavior: 'instant', block: 'nearest' }}
              params={{ artistId: params.artistId }}
              resetScroll={false}
              to="/artist/$artistId"
            >
              Similar artists
            </Link>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content className={css.mainTab} value="main">
          {renderTopSongs(
            <TopSongsSection params={params}>
              <SongList />
            </TopSongsSection>,
            (x, topSongIds) =>
              topSongIds.length !== 0 && (
                <TopSongsSection params={params}>
                  <SongList
                    getSongElementId={getSongElementId}
                    primaryArtist={x.name}
                    songIds={topSongIds.slice(0, 5)}
                    songIdsToPlay={topSongIds}
                  />
                </TopSongsSection>
              ),
          )}

          <section>
            <H2 className={css.mainTabSectionHeading}>
              <Link
                hash="albums"
                hashScrollIntoView={{ behavior: 'instant', block: 'start' }}
                params={{ artistId: params.artistId }}
                resetScroll={false}
                to="/artist/$artistId"
              >
                Albums
              </Link>
            </H2>

            <CardGrid>
              {albumIds
                ? albumIds
                    .slice(-6)
                    .reverse()
                    .map(id => (
                      <AlbumCard
                        key={id}
                        coverArtSizes={card_grid_cover_art_sizes}
                        id={id}
                        loadCoverArtLazily
                      />
                    ))
                : Array.from({ length: 6 }, (_, i) => <AlbumCard key={i} />)}
            </CardGrid>
          </section>

          {renderSimilarArtists(
            <SimilarArtistsSection artistId={params.artistId} />,
            similarArtists => {
              const presentArtists = similarArtists
                .map(x => (x.TAG === 0 ? x._0.id : null))
                .filter(x => x != null);

              return (
                presentArtists.length !== 0 && (
                  <SimilarArtistsSection
                    artistId={params.artistId}
                    presentArtists={presentArtists}
                  />
                )
              );
            },
          )}
        </Tabs.Content>

        <Tabs.Content value="top-songs">
          {renderTopSongs(<SongList />, (x, topSongIds) =>
            topSongIds.length === 0 ? (
              <EmptyState message="No top songs" />
            ) : (
              <SongList
                getSongElementId={getSongElementId}
                primaryArtist={x.name}
                songIds={topSongIds}
              />
            ),
          )}
        </Tabs.Content>

        <Tabs.Content value="albums">
          <CardGrid>
            {albumIds
              ? albumIds
                  .toReversed()
                  .map(id => (
                    <AlbumCard
                      key={id}
                      coverArtSizes={card_grid_cover_art_sizes}
                      id={id}
                      loadCoverArtLazily
                    />
                  ))
              : Array.from({ length: 12 }, (_, i) => <AlbumCard key={i} />)}
          </CardGrid>
        </Tabs.Content>

        <Tabs.Content value="similar-artists">
          {renderSimilarArtists(
            <CardGrid>
              {Array.from({ length: 12 }, (_, i) => (
                <ArtistCard key={i} />
              ))}
            </CardGrid>,
            similarArtists => {
              if (similarArtists.length === 0) {
                return <EmptyState message="No similar artists" />;
              }

              const presentArtists = similarArtists
                .map(x => (x.TAG === 0 ? x._0.id : undefined))
                .filter(x => x != null);

              const notPresentArtists = similarArtists
                .map(x => (x.TAG === 1 ? x._0.name : undefined))
                .filter(x => x != null);

              return (
                <div className={css.similarArtistsTab}>
                  {presentArtists.length !== 0 && (
                    <CardGrid>
                      {presentArtists.map(id => (
                        <ArtistCard
                          key={id}
                          coverArtSizes={card_grid_cover_art_sizes}
                          id={id}
                          loadCoverArtLazily
                        />
                      ))}
                    </CardGrid>
                  )}

                  {notPresentArtists.length !== 0 && (
                    <div className={css.similarArtistsTabNotPresent}>
                      <H2>Not found in a library:</H2>

                      <ul className={css.similarArtistsTabNotPresentList}>
                        {notPresentArtists.map(similarArtist => (
                          <li
                            key={similarArtist}
                            className={css.similarArtistsTabNotPresentItem}
                          >
                            <a
                              href={`https://www.last.fm/music/${encodeURIComponent(similarArtist)}`}
                              rel="noopener"
                              target="_blank"
                            >
                              {similarArtist}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            },
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
