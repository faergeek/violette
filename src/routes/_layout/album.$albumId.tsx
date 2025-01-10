import { createFileRoute, invariant } from '@tanstack/react-router';
import * as v from 'valibot';

import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';

export const Route = createFileRoute('/_layout/album/$albumId')({
  validateSearch: v.object({
    song: v.optional(v.string()),
  }),
  beforeLoad: requireSubsonicCredentials,
  async loader({ context: { store }, params: { albumId } }) {
    const { auth } = store.getState();
    invariant(auth.credentials);

    const albumPromise = store.getState().albums.fetchOne(albumId);

    const basePromise = albumPromise.then(() => {
      const state = store.getState();
      const base = state.albums.baseById.get(albumId);
      invariant(base);

      return base;
    });

    const base = store.getState().albums.baseById.get(albumId);

    if (!base) {
      await basePromise;
    }

    return {
      deferredAlbumInfo: store
        .getState()
        .albums.fetchInfo(albumId)
        .then(() => {
          const state = store.getState();
          const albumInfo = state.albums.infoById.get(albumId);
          invariant(albumInfo);

          return albumInfo;
        }),
    };
  },
});
