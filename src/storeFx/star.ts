import { subsonicStar } from '../api/subsonic/methods/star';
import { Fx } from '../shared/fx';
import type { AppStore } from '../store/create';
import { fetchOneAlbum } from './fetchOneAlbum';
import { fetchOneSong } from './fetchOneSong';
import { fetchOneArtist } from './StoreFx';

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
