import { createFileRoute, invariant } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';
import { fetchArtists } from '../../storeFx/fetchArtists';

export const Route = createFileRoute('/_layout/')({
  beforeLoad: requireSubsonicCredentials,
  async loader({ context: { store } }) {
    await fetchArtists()
      .runAsync({ store })
      .then(result => result.assertOk());

    const { artists } = store.getState();
    invariant(artists.listIds);

    return {
      initialListIds: artists.listIds,
    };
  },
});
