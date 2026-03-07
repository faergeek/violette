import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { value } from './playerContext';

export function setVolume(updateVolume: (prev: number) => number) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    store.setState(prevState => ({
      player: {
        ...prevState.player,
        volume: Math.max(0, Math.min(updateVolume(prevState.player.volume), 1)),
      },
    }));

    if (value.contents) {
      const { player } = store.getState();
      value.contents.volumeNode.gain.value = player.volume;
    }

    return Fx.Ok();
  });
}
