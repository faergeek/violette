import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetSong } from '../api/subsonic/methods/getSong';
import type { AppStore } from '../store/create';

export const fetchOneSong = Fx.async(async function* f(id: string) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;
  const song = yield* subsonicGetSong(id).provide({ credentials });

  const byId = mergeIntoMap(store.getState().songs.byId, [song], x => x.id);

  if (byId !== store.getState().songs.byId) {
    store.setState(prevState => ({ songs: { ...prevState.songs, byId } }));
  }

  return Fx.Ok();
});
