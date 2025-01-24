import { Fx } from '../_core/fx';
import { throttle } from '../_core/throttle';
import type { AppStore } from '../store/create';
import { audio } from './playerContext';
import { updatePlayQueue } from './updatePlayQueue';

const saveCurrentTimeImpl = Fx.async(async function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  const { player } = store.getState();
  if (player.currentSongId == null) return Fx.Ok();

  return updatePlayQueue({ currentTime: Math.floor(audio.currentTime * 1000) });
});

export const saveCurrentTime = throttle(5000, (store: AppStore) =>
  saveCurrentTimeImpl()
    .runAsync({ store })
    .then(result => result.assertOk()),
);
