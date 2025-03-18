import { Fx } from '../_core/fx';
import {
  REPLAY_GAIN_LOCAL_STORAGE_KEY,
  type ReplayGainOptions,
} from '../slices/player';
import type { AppStore } from '../store/create';

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
    REPLAY_GAIN_LOCAL_STORAGE_KEY,
    JSON.stringify(newReplayGainOptions),
  );

  return Fx.Ok();
});
