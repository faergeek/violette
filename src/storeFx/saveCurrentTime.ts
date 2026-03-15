import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { audio } from './playerContext';
import * as StoreFx__UpdatePlayQueue from './updatePlayQueue';

function saveCurrentTimeReal(store: Store) {
  const fx = Fx.Sync(() => {
    if (store.getState().player.currentSongId == null) return Fx.Ok();

    return StoreFx__UpdatePlayQueue.make(prevState => ({
      current: prevState.current,
      currentTime: Math.floor(audio.currentTime * 1000),
      queued: prevState.queued,
    }));
  });

  return Fx.runAsync(fx, { store }).then(result => {
    if (result.TAG !== 0) throw new Error();
  });
}

let timeout: ReturnType<typeof setTimeout> | undefined;

export function saveCurrentTimeThrottled(store: Store) {
  return new Promise((resolve, reject) => {
    if (timeout != null) return;

    timeout = setTimeout(() => {
      timeout = undefined;
      saveCurrentTimeReal(store).then(resolve).catch(reject);
    }, 5000);
  });
}

export function saveCurrentTime(store: Store) {
  clearTimeout(timeout);
  timeout = undefined;
  return saveCurrentTimeReal(store);
}
