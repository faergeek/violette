import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import * as StoreFx__StartPlaying from './startPlaying';

export function goToNextSong() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const state = store.getState();
    const queued = state.player.queuedSongIds;

    const currentIndex =
      state.player.currentSongId == null
        ? 0
        : queued.indexOf(state.player.currentSongId);

    return StoreFx__StartPlaying.make(
      queued[(currentIndex + 1) % queued.length],
    );
  });
}
