import { createRoute, getRouteApi } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import { ArtistsPage } from '../pages/artistsPage';
import { requireSubsonicCredentials } from '../shared/routerUtils';
import { useAppStore } from '../store/context';
import { fetchArtists } from '../storeFx/fetchArtists';
import * as LayoutRoute from './layoutRoute';

function PendingComponent() {
  return <ArtistsPage listIds={Array.from({ length: 30 }, () => undefined)} />;
}

function Component() {
  const { initialListIds } = getRouteApi('/_layout/').useLoaderData();
  const listIds = useAppStore(state => state.artists.listIds);

  return <ArtistsPage listIds={listIds ?? initialListIds} />;
}

export const route = createRoute({
  path: '/',
  beforeLoad: requireSubsonicCredentials,
  component: Component,
  pendingComponent: PendingComponent,
  getParentRoute: () => LayoutRoute.route,
  loader: ({ context }) => {
    const store = context.store;

    return Fx.runAsync(fetchArtists(), { store }).then(result => {
      if (result.TAG !== 0) throw new Error();

      const state = store.getState();

      if (!state.artists.listIds) {
        throw new Error();
      }

      return {
        initialListIds: state.artists.listIds,
      };
    });
  },
});
