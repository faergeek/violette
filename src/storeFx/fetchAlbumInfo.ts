import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetAlbumInfo } from '../api/subsonic/methods/getAlbumInfo';
import type { AppStore } from '../store/create';

export const fetchAlbumInfo = Fx.async(async function* f(albumId: string) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;

  const albumInfo = yield* subsonicGetAlbumInfo(albumId).provide({
    credentials,
  });

  const infoById = mergeIntoMap(
    store.getState().albums.infoById,
    [albumInfo],
    () => albumId,
  );

  if (infoById !== store.getState().albums.infoById) {
    store.setState(prevState => ({
      albums: { ...prevState.albums, infoById },
    }));
  }

  return Fx.Ok();
});
