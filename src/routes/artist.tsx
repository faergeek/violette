import { createRoute, getRouteApi } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import { ArtistPage } from '../pages/artistPage';
import * as CoverArt from '../shared/coverArt';
import { MEDIA_HEADER_COVER_ART_SIZES } from '../shared/mediaHeader';
import { requireSubsonicCredentials } from '../shared/routerUtils';
import { fetchArtistInfo } from '../storeFx/fetchArtistInfo';
import * as FetchOneArtist from '../storeFx/fetchOneArtist';
import { fetchTopSongs } from '../storeFx/fetchTopSongs';
import * as LayoutRoute from './layoutRoute';

function PendingComponent() {
  const routeApi = getRouteApi('/_layout/artist/$artistId');
  const params = routeApi.useParams();

  return <ArtistPage params={params} />;
}

function Component() {
  const routeApi = getRouteApi('/_layout/artist/$artistId');
  const params = routeApi.useParams();
  const loaderData = routeApi.useLoaderData();

  return (
    <ArtistPage
      deferredArtistInfo={loaderData.deferredArtistInfo}
      deferredSimilarArtists={loaderData.deferredSimilarArtists}
      deferredTopSongIds={loaderData.deferredTopSongIds}
      initialAlbumIds={loaderData.initialAlbumIds}
      initialArtist={loaderData.initialArtist}
      params={params}
    />
  );
}

export const route = createRoute({
  path: '/artist/$artistId',
  beforeLoad: requireSubsonicCredentials,
  pendingComponent: PendingComponent,
  component: Component,
  getParentRoute: () => LayoutRoute.route,
  loader: ({ context, params }) => {
    const store = context.store;

    return Fx.runAsync(FetchOneArtist.make(params.artistId), { store }).then(
      result => {
        if (result.TAG !== 0) throw new Error();
        const state = store.getState();
        const initialArtist = state.artists.byId.get(params.artistId);
        if (!initialArtist) throw new Error();

        const credentials = state.auth.credentials;
        if (!credentials) throw new Error();

        CoverArt.preload(
          credentials,
          initialArtist.coverArt,
          MEDIA_HEADER_COVER_ART_SIZES,
        );

        const initialAlbumIds = state.artists.albumIdsByArtistId.get(
          params.artistId,
        );
        if (!initialAlbumIds) throw new Error();

        const deferredTopSongIds = Fx.runAsync(
          fetchTopSongs(initialArtist.name),
          { store },
        ).then(result1 => {
          if (result1.TAG !== 0) throw new Error();

          const topSongIds = store
            .getState()
            .artists.topSongIdsByArtistName.get(initialArtist.name);
          if (!topSongIds) throw new Error();

          return topSongIds;
        });

        const artistInfoPromise = Fx.runAsync(
          fetchArtistInfo(params.artistId),
          { store },
        ).then(result1 => {
          if (result1.TAG !== 0) throw new Error();
        });

        return {
          deferredArtistInfo: artistInfoPromise.then(() => {
            const artistInfo = store
              .getState()
              .artists.artistInfoById.get(params.artistId);
            if (!artistInfo) throw new Error();

            return artistInfo;
          }),
          deferredSimilarArtists: artistInfoPromise.then(() => {
            const similarArtists = store
              .getState()
              .artists.similarArtistsById.get(params.artistId);
            if (!similarArtists) throw new Error();

            return similarArtists;
          }),
          deferredTopSongIds,
          initialAlbumIds,
          initialArtist,
        };
      },
    );
  },
});
