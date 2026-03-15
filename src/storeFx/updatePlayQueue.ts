import { deepEqual } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { savePlayQueue } from '../subsonic';

interface PlayQueueState {
  current?: string;
  currentTime: number;
  queued: string[];
}

export function make(playQueueState: (prev: PlayQueueState) => PlayQueueState) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const state = store.getState();

    const updatedPlayQueueState = playQueueState({
      current: state.player.currentSongId,
      currentTime: state.player.currentTime,
      queued: state.player.queuedSongIds,
    });

    if (!deepEqual(updatedPlayQueueState.queued, state.player.queuedSongIds)) {
      store.setState(prevState => ({
        albums: prevState.albums,
        artists: prevState.artists,
        auth: prevState.auth,
        player: {
          ...prevState.player,
          queuedSongIds: updatedPlayQueueState.queued,
        },
        songs: prevState.songs,
      }));
    }

    return Fx.catch_(
      Fx.provide(
        savePlayQueue(
          updatedPlayQueueState.queued,
          state.player.currentSongId ?? updatedPlayQueueState.current,
          updatedPlayQueueState.currentTime,
        ),
        { credentials: state.auth.credentials },
      ),
      () => Fx.Err(undefined),
    );
  });
}
