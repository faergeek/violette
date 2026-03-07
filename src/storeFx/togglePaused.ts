import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import * as StoreFx__Pause from './pause';
import * as StoreFx__Play from './play';

export function make() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    store.getState().player.paused
      ? StoreFx__Play.make()
      : StoreFx__Pause.make(),
  );
}
