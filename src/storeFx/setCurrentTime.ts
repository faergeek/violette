import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { audio, skipping } from './playerContext';
import { saveCurrentTime } from './saveCurrentTime';

export function setCurrentTime(updateCurrentTime: (prev: number) => number) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const { player } = store.getState();
    skipping.contents = true;

    const currentTime = Math.max(
      0,
      Math.min(
        updateCurrentTime(player.currentTime),
        player.duration ?? Infinity,
      ),
    );

    if (currentTime === audio.currentTime) return Fx.Ok();

    return Fx.Async(() => {
      audio.currentTime = currentTime;

      store.setState(prevState => ({
        player: { ...prevState.player, currentTime },
      }));

      return saveCurrentTime(store).then(
        () => Fx.Ok(),
        () => Fx.Err(undefined),
      );
    });
  });
}
