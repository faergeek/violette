import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { Fx } from '../../_core/fx';
import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';
import {
  subsonicGetArtist,
  subsonicGetArtistInfo,
  subsonicGetTopSongs,
} from '../../api/subsonic';
import type { SubsonicCredentials } from '../../api/types';

const loaderFx = Fx.async(async function* f(artistId: string) {
  const { credentials } = yield* Fx.ask<{ credentials: SubsonicCredentials }>();
  const artist = yield* subsonicGetArtist(artistId);

  return Fx.Ok({
    artist,
    deferredArtistInfo: subsonicGetArtistInfo(artistId, {
      includeNotPresent: true,
    })
      .runAsync({ credentials })
      .then(result => result.assertOk()),
    deferredTopSongs: subsonicGetTopSongs(artist.name)
      .runAsync({
        credentials,
      })
      .then(result => result.assertOk()),
    credentials,
  });
});

export const Route = createFileRoute('/_layout/artist/$artistId')({
  validateSearch: v.object({
    tab: v.optional(
      v.union([
        v.literal('albums'),
        v.literal('top-songs'),
        v.literal('similar-artists'),
      ]),
    ),
  }),
  async loader({ context, location, params: { artistId } }) {
    const credentials = requireSubsonicCredentials(context, location);

    return loaderFx(artistId)
      .runAsync({ credentials })
      .then(result => result.assertOk());
  },
});
