import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap.js';
import type { Store } from '../store/types';
import { getPlayQueue } from '../subsonic';
import { setCurrentTime } from './setCurrentTime';

export function initializePlayQueue() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const credentials = store.getState().auth.credentials;
    if (!credentials) return Fx.Ok();

    return Fx.bind(
      Fx.catch_(Fx.provide(getPlayQueue(), { credentials }), error =>
        error.kind === 'no-credentials' ||
        error.kind === 'network-error' ||
        error.kind !== 'api-error' ||
        error.code !== 70
          ? Fx.Err(error)
          : Fx.Ok(undefined),
      ),
      playQueue => {
        const currentSongId =
          playQueue?.current != null ? String(playQueue.current) : undefined;

        if (currentSongId != null) {
          Fx.runAsync(
            setCurrentTime(() => (playQueue?.position ?? 0) / 1000),
            { store },
          );
        }

        store.setState(prevState => {
          const state = store.getState();

          return {
            player: {
              ...prevState.player,
              currentSongId,
              queuedSongIds: playQueue?.entry.map(song => song.id) ?? [],
            },
            songs: {
              byId:
                playQueue == null
                  ? state.songs.byId
                  : mergeIntoMap(state.songs.byId, playQueue.entry, x => x.id),
            },
          };
        });

        return Fx.Ok();
      },
    );
  });
}
