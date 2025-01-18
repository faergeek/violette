import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetArtist } from '../api/subsonic/methods/getArtist';
import type { AppStore } from '../store/create';

export const fetchOneArtist = Fx.async(async function* f(artistId: string) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;

  const { album, ...artist } = yield* subsonicGetArtist(artistId).provide({
    credentials,
  });

  const albumBaseById = mergeIntoMap(
    store.getState().albums.baseById,
    album,
    x => x.id,
  );

  const albumIdsByArtistId = mergeIntoMap(
    store.getState().artists.albumIdsByArtistId,
    [album.map(x => x.id)],
    () => artist.id,
  );

  const byId = mergeIntoMap(store.getState().artists.byId, [artist], x => x.id);

  if (
    albumBaseById !== store.getState().albums.baseById ||
    albumIdsByArtistId !== store.getState().artists.albumIdsByArtistId ||
    byId !== store.getState().artists.byId
  ) {
    store.setState(prevState => ({
      albums: {
        ...prevState.albums,
        baseById: albumBaseById,
      },
      artists: {
        ...prevState.artists,
        albumIdsByArtistId,
        byId,
      },
    }));
  }

  return Fx.Ok();
});
