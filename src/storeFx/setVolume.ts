import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { playerContext } from './playerContext';

export const setVolume = Fx.sync(function* f(
  volume: number | ((volume: number) => number),
) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  store.setState(prevState => ({
    player: {
      ...prevState.player,
      volume: Math.max(
        0,
        Math.min(
          typeof volume === 'function'
            ? volume(prevState.player.volume)
            : volume,
          1,
        ),
      ),
    },
  }));

  if (playerContext) {
    playerContext.volumeNode.gain.value = store.getState().player.volume;
  }

  return Fx.Ok();
});
