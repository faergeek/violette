import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { pause } from './pause';
import { play } from './play';

export const togglePaused = Fx.async(async function* f(paused?: boolean) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  const { player } = store.getState();
  paused ??= !player.paused;

  return paused ? pause() : play();
});
