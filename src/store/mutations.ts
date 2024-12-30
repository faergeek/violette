import { Result } from '@faergeek/monads';
import invariant from 'tiny-invariant';

import {
  subsonicGetPlayQueue,
  subsonicGetStreamUrl,
  subsonicSavePlayQueue,
} from '../api/subsonic';
import type { BaseSong } from '../api/types';
import type { StoreMutator } from './react';

function assignAudioSrc(src: string): StoreMutator<void> {
  return store => {
    const state = store.getState();
    if (state.audio.src !== src) state.audio.src = src;
  };
}

export function refreshPlayQueue(): StoreMutator<Promise<void>> {
  return async store => {
    const state = store.getState();
    invariant(state.credentials);

    const playQueue = await subsonicGetPlayQueue()
      .runAsync({ credentials: state.credentials })
      .then(result =>
        result
          .flatMapErr(err =>
            err.type === 'api-error' && err.code === 70
              ? Result.Ok(undefined)
              : Result.Err(err),
          )
          .assertOk(),
      );

    const currentSongId = playQueue?.current;

    store.setState({ currentSongId, queuedSongs: playQueue?.entry ?? [] });

    if (currentSongId != null) {
      assignAudioSrc(subsonicGetStreamUrl(state.credentials, currentSongId))(
        store,
      );
    }
  };
}

function savePlayQueue(
  queuedSongs: BaseSong[],
  {
    currentSongId,
    position,
  }: {
    currentSongId?: string;
    position?: number;
  } = {},
): StoreMutator<Promise<void>> {
  return async store => {
    store.setState({ currentSongId, queuedSongs });

    const state = store.getState();
    invariant(state.credentials);

    await subsonicSavePlayQueue(
      queuedSongs.map(s => s.id),
      { current: currentSongId, position },
    )
      .runAsync({ credentials: state.credentials })
      .then(result => result.assertOk());
  };
}

export function togglePlayback(on?: boolean): StoreMutator<void> {
  return store => {
    const state = store.getState();
    if (on == null) on = state.paused;

    if (on) state.audio.play();
    else state.audio.pause();
  };
}

export function startPlaying(
  song: BaseSong,
  queuedSongs?: BaseSong[],
): StoreMutator<Promise<void>> {
  return async store => {
    const state = store.getState();
    invariant(state.credentials);
    assignAudioSrc(subsonicGetStreamUrl(state.credentials, song.id))(store);
    togglePlayback(true)(store);

    await savePlayQueue(queuedSongs ?? state.queuedSongs, {
      currentSongId: song.id,
    })(store);
  };
}

export function goToPrevSong(): StoreMutator<Promise<void>> {
  return async store => {
    const state = store.getState();

    if (state.audio.currentTime > 3) {
      state.audio.currentTime = 0;
      return;
    }

    const currentIndex = state.queuedSongs.findIndex(
      s => s.id === state.currentSongId,
    );

    const prevIndex =
      (state.queuedSongs.length + currentIndex - 1) % state.queuedSongs.length;

    const prevSong = state.queuedSongs[prevIndex];

    await startPlaying(prevSong)(store);
  };
}

export function goToNextSong(): StoreMutator<Promise<void>> {
  return async store => {
    const state = store.getState();
    const currentIndex = state.queuedSongs.findIndex(
      s => s.id === state.currentSongId,
    );

    const nextIndex = (currentIndex + 1) % state.queuedSongs.length;
    const nextSong = state.queuedSongs[nextIndex];

    await startPlaying(nextSong)(store);
  };
}

export function setPaused(paused: boolean): StoreMutator<Promise<void>> {
  return async store => {
    store.setState({ paused });
  };
}
