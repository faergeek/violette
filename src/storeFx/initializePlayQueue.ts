import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetPlayQueue } from '../api/subsonic/methods/getPlayQueue';
import type { AppStore } from '../store/create';
import { setCurrentTime } from './setCurrentTime';

export const initializePlayQueue = Fx.async(async function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;
  if (!credentials) return Fx.Ok();

  const playQueue = yield* subsonicGetPlayQueue()
    .provide({ credentials })
    .catch(err =>
      err.type === 'api-error' && err.code === 70
        ? Fx.Ok(undefined)
        : Fx.Err(err),
    );

  const currentSongId = playQueue?.current;

  if (currentSongId != null) {
    setCurrentTime((playQueue?.position ?? 0) / 1000).runAsync({ store });
  }

  store.setState(prevState => ({
    player: {
      ...prevState.player,
      currentSongId,
      isInitialized: true,
      queuedSongIds: playQueue?.entry.map(song => song.id) ?? [],
    },
    songs: {
      ...prevState.songs,
      byId: playQueue?.entry
        ? mergeIntoMap(store.getState().songs.byId, playQueue.entry, x => x.id)
        : store.getState().songs.byId,
    },
  }));

  return Fx.Ok();
});
