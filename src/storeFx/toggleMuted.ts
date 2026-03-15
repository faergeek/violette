import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { value } from './playerContext';

export function toggleMuted() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
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

    return Fx.Sync(() => {
      if (value.contents) {
        const { player } = store.getState();

        value.contents.volumeNode.gain.value = player.muted ? 0 : player.volume;
      }

      return Fx.Ok();
    });
  });
}
