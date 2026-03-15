import { deepEqual } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { goToNextSong } from './goToNextSong';
import { audio } from './playerContext';
import { saveCurrentTimeThrottled } from './saveCurrentTime';

export function subscribeToAudioEvents() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    const abortController = new AbortController();

    audio.addEventListener(
      'ended',
      () => {
        Fx.runAsync(goToNextSong(), { store }).then(result => {
          if (result.TAG !== 0) throw new Error();
        });
      },
      { signal: abortController.signal },
    );

    audio.addEventListener(
      'emptied',
      () => {
        store.setState(prevState => ({
          player: {
            ...prevState.player,
            buffered: [],
            currentTime: 0,
            duration: undefined,
            muted: prevState.player.muted,
            paused: true,
            volume: prevState.player.volume,
          },
        }));
      },
      { signal: abortController.signal },
    );

    audio.addEventListener(
      'durationchange',
      () => {
        store.setState(prevState => ({
          player: {
            ...prevState.player,
            duration: Number.isFinite(audio.duration)
              ? audio.duration
              : undefined,
          },
        }));
      },
      { signal: abortController.signal },
    );

    audio.addEventListener(
      'pause',
      () => {
        store.setState(prevState => ({
          player: {
            ...prevState.player,
            paused: true,
          },
        }));
      },
      { signal: abortController.signal },
    );

    audio.addEventListener(
      'play',
      () => {
        store.setState(prevState => ({
          player: {
            ...prevState.player,
            paused: false,
          },
        }));
      },
      { signal: abortController.signal },
    );

    let updateCurrentTimeRaf: number | undefined;
    audio.addEventListener(
      'timeupdate',
      () => {
        if (updateCurrentTimeRaf != null) {
          cancelAnimationFrame(updateCurrentTimeRaf);
        }

        updateCurrentTimeRaf = requestAnimationFrame(() => {
          updateCurrentTimeRaf = undefined;

          store.setState(prevState => ({
            player: {
              ...prevState.player,
              currentTime: audio.currentTime,
            },
          }));
        });

        saveCurrentTimeThrottled(store);
      },
      { signal: abortController.signal },
    );

    store.setState(prevState => ({
      player: {
        ...prevState.player,
        currentTime: audio.currentTime,
        duration: Number.isFinite(audio.duration) ? audio.duration : undefined,
        muted: audio.muted,
        paused: audio.paused,
        volume: audio.volume,
      },
    }));

    const interval = setInterval(() => {
      if (audio.src === '') return;

      const buffered = Array.from(
        { length: audio.buffered.length },
        (_, i) => ({
          end: audio.buffered.end(i),
          start: audio.buffered.start(i),
        }),
      );

      const state = store.getState();

      if (!deepEqual(buffered, state.player.buffered)) {
        store.setState(prevState => ({
          player: {
            ...prevState.player,
            buffered,
          },
        }));
      }
    }, 500);

    return Fx.Ok(() => {
      clearInterval(interval);
      abortController.abort();
    });
  });
}
