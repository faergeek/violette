import { deepEqual } from '@tanstack/react-router';

import { Fx } from '../_core/fx';
import { subsonicSavePlayQueue } from '../api/subsonic/methods/savePlayQueue';
import type { AppStore } from '../store/create';

interface PlayQueueState {
  current: string | undefined;
  currentTime: number;
  queued: string[];
}

export const updatePlayQueue = Fx.async(async function* f<
  K extends keyof PlayQueueState,
>(
  playQueueState:
    | { [Key in K]: PlayQueueState[Key] }
    | ((prevState: PlayQueueState) => { [Key in K]: PlayQueueState[Key] }),
) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { auth, player } = store.getState();

  playQueueState =
    typeof playQueueState === 'function'
      ? playQueueState({
          current: player.currentSongId,
          currentTime: player.currentTime,
          queued: player.queuedSongIds,
        })
      : playQueueState;

  const { current, currentTime, queued } = {
    current: player.currentSongId,
    currentTime: player.currentTime,
    queued: player.queuedSongIds,
    ...playQueueState,
  };

  if (!deepEqual(queued, player.queuedSongIds)) {
    store.setState(prevState => ({
      player: {
        ...prevState.player,
        queuedSongIds: queued,
      },
    }));
  }

  return subsonicSavePlayQueue(queued, current, {
    position: currentTime,
  }).provide({ credentials: auth.credentials });
});
