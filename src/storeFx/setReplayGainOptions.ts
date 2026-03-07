import * as Fx from '../fx/fx';
import type { ReplayGainOptions } from '../store/state';
import { REPLAY_GAIN_LOCAL_STORAGE_KEY } from '../store/store';
import type { Store } from '../store/types';

export function setReplayGainOptions(
  updateReplayGainOptions: (prev: ReplayGainOptions) => ReplayGainOptions,
) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const { player } = store.getState();

    const { preAmp, preferredGain } = updateReplayGainOptions(
      player.replayGainOptions,
    );

    const newReplayGainOptions = {
      preAmp: Math.max(-15, Math.min(preAmp, 15)),
      preferredGain,
    };

    store.setState(prevState => ({
      player: {
        ...prevState.player,
        replayGainOptions: newReplayGainOptions,
      },
    }));

    localStorage.setItem(
      REPLAY_GAIN_LOCAL_STORAGE_KEY,
      JSON.stringify(newReplayGainOptions),
    );

    return Fx.Ok();
  });
}
