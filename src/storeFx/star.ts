import { Fx } from '../_core/fx';
import { subsonicStar } from '../api/subsonic/methods/star';
import type { StarParams } from '../api/subsonic/types/starParams';
import type { AppStore } from '../store/create';
import { fetchOneAlbum } from './fetchOneAlbum';
import { fetchOneArtist } from './fetchOneArtist';
import { fetchOneSong } from './fetchOneSong';

export const star = Fx.async(async function* f(params: StarParams) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;
  yield* subsonicStar(params).provide({ credentials });

  return params.albumId != null
    ? fetchOneAlbum(params.albumId)
    : params.artistId != null
      ? fetchOneArtist(params.artistId)
      : fetchOneSong(params.id);
});
