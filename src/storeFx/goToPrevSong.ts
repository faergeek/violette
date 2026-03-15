import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import * as StoreFx__Play from './play';
import { setCurrentTime } from './setCurrentTime';
import * as StoreFx__StartPlaying from './startPlaying';

export function goToPrevSong() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const { player } = store.getState();

    if (player.currentTime > 3) {
      return Fx.bind(
        setCurrentTime(() => 0),
        () => StoreFx__Play.make(),
      );
    }

    const queued = player.queuedSongIds;
    const len = queued.length;

    const currentIndex =
      player.currentSongId == null ? 0 : queued.indexOf(player.currentSongId);

    return StoreFx__StartPlaying.make(queued[(currentIndex + len - 1) % len]);
  });
}
