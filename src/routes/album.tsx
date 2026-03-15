import { createRoute, getRouteApi } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import { AlbumPage } from '../pages/albumPage';
import * as CoverArt from '../shared/coverArt';
import { MEDIA_HEADER_COVER_ART_SIZES } from '../shared/mediaHeader';
import { requireSubsonicCredentials } from '../shared/routerUtils';
import { fetchAlbumInfo } from '../storeFx/fetchAlbumInfo';
import * as FetchOneAlbum from '../storeFx/fetchOneAlbum';
import * as LayoutRoute from './layoutRoute';

function PendingComponent() {
  const routeApi = getRouteApi('/_layout/album/$albumId');
  const params = routeApi.useParams();

  return <AlbumPage albumId={params.albumId} />;
}

function Component() {
  const routeApi = getRouteApi('/_layout/album/$albumId');
  const params = routeApi.useParams();
  const loaderData = routeApi.useLoaderData();

  return (
    <AlbumPage
      albumId={params.albumId}
      deferredAlbumInfo={loaderData.deferredAlbumInfo}
    />
  );
}

export const route = createRoute({
  path: '/album/$albumId',
  pendingComponent: PendingComponent,
  component: Component,
  beforeLoad: requireSubsonicCredentials,
  getParentRoute: () => LayoutRoute.route,
  loader: ({ context, params }) => {
    const store = context.store;
    const state = store.getState();
    const credentials = state.auth.credentials;
    if (!credentials) throw new Error();

    const albumPromise = Fx.runAsync(FetchOneAlbum.make(params.albumId), {
      store,
    }).then(result => {
      if (result.TAG !== 0) throw new Error();
    });

    const basePromise = albumPromise.then(() => {
      const baseAlbum = store.getState().albums.baseById.get(params.albumId);
      if (!baseAlbum) throw new Error();
      return baseAlbum;
    });

    const base = state.albums.baseById.get(params.albumId);
    return (base != null ? Promise.resolve(base) : basePromise).then(
      baseAlbum => {
        CoverArt.preload(
          credentials,
          baseAlbum.coverArt,
          MEDIA_HEADER_COVER_ART_SIZES,
        );

        return {
          deferredAlbumInfo: Fx.runAsync(fetchAlbumInfo(params.albumId), {
            store,
          }).then(result => {
            if (result.TAG !== 0) throw new Error();

            const albumInfo = store
              .getState()
              .albums.infoById.get(params.albumId);
            if (!albumInfo) throw new Error();

            return albumInfo;
          }),
        };
      },
    );
  },
});
