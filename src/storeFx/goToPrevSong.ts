import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { play } from './play';
import { setCurrentTime } from './setCurrentTime';
import { startPlaying } from './startPlaying';

export const goToPrevSong = Fx.async(async function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  return store.getState().player.currentTime > 3
    ? setCurrentTime(0).flatMap(play)
    : startPlaying(({ current, queued }) => ({
        current:
          queued[
            (queued.length +
              (current == null ? 0 : queued.indexOf(current)) -
              1) %
              queued.length
          ],
      }));
});
