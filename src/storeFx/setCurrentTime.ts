import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { audio, setSkipping } from './playerContext';
import { saveCurrentTime } from './saveCurrentTime';

export const setCurrentTime = Fx.async(async function* f(
  currentTime: number | ((currentTime: number) => number),
) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  const { player } = store.getState();

  setSkipping(true);

  currentTime =
    typeof currentTime === 'function'
      ? currentTime(player.currentTime)
      : currentTime;

  currentTime = Math.max(0, Math.min(currentTime, player.duration ?? Infinity));

  if (currentTime === audio.currentTime) return Fx.Ok();

  audio.currentTime = currentTime;
  store.setState({ player: { ...player, currentTime } });

  try {
    await saveCurrentTime.now(store);
    return Fx.Ok();
  } catch (err) {
    return Fx.Err(err);
  }
});
