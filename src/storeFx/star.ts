import { Fx } from '../_core/fx';
import { subsonicStar } from '../api/subsonic/methods/star';
import type { AppStore } from '../store/create';
import { fetchOneAlbum } from './fetchOneAlbum';
import { fetchOneArtist } from './fetchOneArtist';
import { fetchOneSong } from './fetchOneSong';

export const star = Fx.async(async function* f(params: {
  albumId?: string;
  artistId?: string;
  id?: string;
}) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;
  yield* subsonicStar(params).provide({ credentials });

  return params.albumId != null
    ? fetchOneAlbum(params.albumId)
    : params.artistId != null
      ? fetchOneArtist(params.artistId)
      : params.id != null
        ? fetchOneSong(params.id)
        : Fx.Ok();
});
