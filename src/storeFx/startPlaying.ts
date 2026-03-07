import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import * as StoreFx__Play from './play';
import * as StoreFx__UpdatePlayQueue from './updatePlayQueue';

export function make(current: string, queued?: string[]) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    store.setState(prevState => ({
      player: {
        ...prevState.player,
        currentSongId: current,
      },
    }));

    return Fx.bind(StoreFx__Play.make(), () =>
      Fx.catch_(
        StoreFx__UpdatePlayQueue.make(prevState => ({
          current: prevState.current,
          currentTime: prevState.currentTime,
          queued: queued ?? store.getState().player.queuedSongIds,
        })),
        () => Fx.Err(undefined),
      ),
    );
  });
}
