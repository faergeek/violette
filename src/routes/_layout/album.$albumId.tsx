import { createFileRoute, invariant } from '@tanstack/react-router';
import * as v from 'valibot';

import { MEDIA_HEADER_COVER_ART_SIZES } from '../../_core/mediaHeader';
import { preloadCoverArt } from '../../_core/preloadCoverArt';
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

    let base = store.getState().albums.baseById.get(albumId);

    if (!base) {
      base = await basePromise;
    }

    const { credentials } = store.getState().auth;
    invariant(credentials);
    preloadCoverArt({
      coverArt: base.coverArt,
      credentials,
      sizes: MEDIA_HEADER_COVER_ART_SIZES,
    });

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
