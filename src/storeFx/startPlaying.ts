import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { play } from './play';
import { updatePlayQueue } from './updatePlayQueue';

interface StartPlayingParams {
  current: string;
  queued?: string[];
}

export const startPlaying = Fx.async(async function* f(
  params:
    | StartPlayingParams
    | ((prevState: {
        current: string | undefined;
        queued: string[];
      }) => StartPlayingParams),
) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { player } = store.getState();

  params =
    typeof params === 'function'
      ? params({ current: player.currentSongId, queued: player.queuedSongIds })
      : params;

  const { current, queued = player.queuedSongIds } = params;

  store.setState(prevState => ({
    player: { ...prevState.player, currentSongId: current },
  }));

  return play().flatMap(() => updatePlayQueue({ queued }));
});
