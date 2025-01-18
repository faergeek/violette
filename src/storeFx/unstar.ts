import { Fx } from '../_core/fx';
import { subsonicUnstar } from '../api/subsonic/methods/unstar';
import type { StarParams } from '../api/subsonic/types/starParams';
import type { AppStore } from '../store/create';
import { fetchOneAlbum } from './fetchOneAlbum';
import { fetchOneArtist } from './fetchOneArtist';
import { fetchOneSong } from './fetchOneSong';

export const unstar = Fx.async(async function* f(params: StarParams) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;
  yield* subsonicUnstar(params).provide({ credentials });

  return params.albumId != null
    ? fetchOneAlbum(params.albumId)
    : params.artistId != null
      ? fetchOneArtist(params.artistId)
      : fetchOneSong(params.id);
});
