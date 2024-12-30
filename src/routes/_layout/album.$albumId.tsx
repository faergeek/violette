import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { Fx } from '../../_core/fx';
import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';
import { subsonicGetAlbum, subsonicGetAlbumInfo } from '../../api/subsonic';
import type { SubsonicCredentials } from '../../api/types';

const loaderFx = Fx.async(async function* f(albumId: string) {
  const { credentials } = yield* Fx.ask<{ credentials: SubsonicCredentials }>();
  const album = yield* subsonicGetAlbum(albumId);

  return Fx.Ok({
    album,
    deferredAlbumInfo: subsonicGetAlbumInfo(albumId)
      .runAsync({ credentials })
      .then(result => result.assertOk()),
    credentials,
  });
});

export const Route = createFileRoute('/_layout/album/$albumId')({
  validateSearch: v.object({
    song: v.optional(v.string()),
  }),
  async loader({ context, location, params: { albumId } }) {
    const credentials = requireSubsonicCredentials(context, location);

    return loaderFx(albumId)
      .runAsync({ credentials })
      .then(result => result.assertOk());
  },
});
