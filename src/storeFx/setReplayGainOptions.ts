import { Fx } from '../shared/fx';
import type { AppStore } from '../store/create';
import {
  replay_gain_local_storage_key,
  type ReplayGainOptions,
} from '../store/Player';

export const setReplayGainOptions = Fx.sync(function* f(
  newReplayGainOptions:
    | ReplayGainOptions
    | ((replayGain: ReplayGainOptions) => ReplayGainOptions),
) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { replayGainOptions } = store.getState().player;

  newReplayGainOptions =
    typeof newReplayGainOptions === 'function'
      ? newReplayGainOptions(replayGainOptions)
      : newReplayGainOptions;

  newReplayGainOptions = {
    ...newReplayGainOptions,
    preAmp: Math.max(-15, Math.min(newReplayGainOptions.preAmp, 15)),
  };

  store.setState(prevState => ({
    player: {
      ...prevState.player,
      replayGainOptions: newReplayGainOptions,
    },
  }));

  localStorage.setItem(
    replay_gain_local_storage_key,
    JSON.stringify(newReplayGainOptions),
  );

  return Fx.Ok();
});
