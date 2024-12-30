import { Await, getRouteApi, Link } from '@tanstack/react-router';

import { AlbumCard } from '../_core/albumCard';
import { ArtistCard } from '../_core/artistCard';
import { CardGrid } from '../_core/cardGrid';
import { H1 } from '../_core/headings';
import { MediaHeader } from '../_core/mediaHeader';
import { MediaLinks } from '../_core/mediaLinks';
import { Prose } from '../_core/prose';
import { SongList } from '../_core/songList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../_core/tabs';

export function Artist() {
  const routeApi = getRouteApi('/_layout/artist/$artistId');
  const params = routeApi.useParams();
  const search = routeApi.useSearch();

  const { artist, credentials, deferredArtistInfo, deferredTopSongs } =
    routeApi.useLoaderData();

  return (
    <article>
      <MediaHeader
        coverArt={artist.coverArt}
        credentials={credentials}
        links={
          <Await
            fallback={<MediaLinks skeleton />}
            promise={deferredArtistInfo}
          >
            {info => (
              <MediaLinks
                lastFmUrl={info.lastFmUrl}
                musicBrainzUrl={
                  info.musicBrainzId
                    ? `https://musicbrainz.org/artist/${artist.musicBrainzId}`
                    : undefined
                }
              />
            )}
          </Await>
        }
      >
        <div className="space-y-2">
          <div>
            <div className="text-sm uppercase text-muted-foreground">
              Artist
            </div>

            <H1>{artist.name}</H1>

            <div className="text-muted-foreground">
              <Link
                params={{ artistId: artist.id }}
                search={{ tab: 'albums' }}
                to="/artist/$artistId"
              >
                {artist.albumCount} albums
              </Link>
            </div>
          </div>

          <Await
            fallback={<Prose as="p" skeleton />}
            promise={deferredArtistInfo}
          >
            {details =>
              details.biography && <Prose as="p" html={details.biography} />
            }
          </Await>
        </div>
      </MediaHeader>

      <Tabs value={search.tab ?? ''}>
        <TabsList>
          <TabsTrigger asChild value="">
            <Link params={params} to="/artist/$artistId">
              Main
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value="top-songs">
            <Link
              params={params}
              search={{ tab: 'top-songs' }}
              to="/artist/$artistId"
            >
              Top songs
            </Link>
          </TabsTrigger>

          <TabsTrigger asChild value="albums">
            <Link
              params={params}
              search={{ tab: 'albums' }}
              to="/artist/$artistId"
            >
              Albums
            </Link>
          </TabsTrigger>

          <Await fallback={<></>} promise={deferredArtistInfo}>
            {artistInfo =>
              artistInfo.similarArtist && (
                <TabsTrigger asChild value="similar-artists">
                  <Link
                    params={params}
                    search={{ tab: 'similar-artists' }}
                    to="/artist/$artistId"
                  >
                    Similar artists
                  </Link>
                </TabsTrigger>
              )
            }
          </Await>
        </TabsList>

        <TabsContent className="space-y-4" value="">
          <section>
            <h2 className="mb-2 text-lg font-bold">
              <Link
                params={params}
                search={{ tab: 'top-songs' }}
                to="/artist/$artistId"
              >
                Top songs
              </Link>
            </h2>

            <Await fallback={<SongList skeleton />} promise={deferredTopSongs}>
              {topSongs =>
                topSongs && (
                  <SongList
                    credentials={credentials}
                    primaryArtist={artist.name}
                    songs={topSongs.slice(0, 5)}
                    songsToPlay={topSongs}
                  />
                )
              }
            </Await>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">
              <Link
                params={{ artistId: artist.id }}
                search={{ tab: 'albums' }}
                to="/artist/$artistId"
              >
                Albums
              </Link>
            </h2>

            <CardGrid>
              {artist.album
                .toReversed()
                .slice(0, 6)
                .map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    credentials={credentials}
                  />
                ))}
            </CardGrid>
          </section>
        </TabsContent>

        <TabsContent value="top-songs">
          <Await fallback={<></>} promise={deferredTopSongs}>
            {topSongs =>
              topSongs && (
                <SongList
                  credentials={credentials}
                  primaryArtist={artist.name}
                  songs={topSongs}
                />
              )
            }
          </Await>
        </TabsContent>

        <TabsContent value="albums">
          <CardGrid>
            {artist.album.toReversed().map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                credentials={credentials}
              />
            ))}
          </CardGrid>
        </TabsContent>

        <Await fallback={<></>} promise={deferredArtistInfo}>
          {artistInfo =>
            artistInfo.similarArtist && (
              <TabsContent value="similar-artists">
                <CardGrid>
                  {artistInfo.similarArtist
                    .map(({ coverArt, id, name }) =>
                      coverArt && id ? { coverArt, id, name } : null,
                    )
                    .filter(similarArtist => similarArtist != null)
                    .map(similarArtist => (
                      <ArtistCard
                        key={similarArtist.id ?? similarArtist.name}
                        artist={similarArtist}
                        credentials={credentials}
                      />
                    ))}
                </CardGrid>

                <ul className="list-outside list-disc space-y-2 ps-5">
                  {artistInfo.similarArtist
                    .map(({ coverArt, id, name }) =>
                      coverArt == null ? { id, name } : null,
                    )
                    .filter(similarArtist => similarArtist != null)
                    .map(similarArtist => (
                      <li key={similarArtist.id ?? similarArtist.name}>
                        {similarArtist.name}
                      </li>
                    ))}
                </ul>
              </TabsContent>
            )
          }
        </Await>
      </Tabs>
    </article>
  );
}
