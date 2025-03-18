import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { playerContext } from './playerContext';

export const toggleMuted = Fx.sync(function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  store.setState(prevState => ({
    player: {
      ...prevState.player,
      muted: !(prevState.player.muted || prevState.player.volume === 0),
      volume:
        (prevState.player.muted && prevState.player.volume === 0) ||
        prevState.player.volume === 0
          ? 0.5
          : prevState.player.volume,
    },
  }));

  if (playerContext) {
    playerContext.volumeNode.gain.value = store.getState().player.muted
      ? 0
      : store.getState().player.volume;
  }

  return Fx.Ok();
});
