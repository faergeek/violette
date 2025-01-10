import { createFileRoute, invariant } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';

export const Route = createFileRoute('/_layout/')({
  beforeLoad: requireSubsonicCredentials,
  async loader({ context: { store } }) {
    await store.getState().artists.fetchAll();

    const { artists } = store.getState();
    invariant(artists.listIds);

    return {
      initialListIds: artists.listIds,
    };
  },
});
