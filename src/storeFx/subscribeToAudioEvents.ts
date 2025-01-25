import { deepEqual } from '@tanstack/react-router';

import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import { goToNextSong } from './goToNextSong';
import type { TimeRange } from './playerContext';
import { audio } from './playerContext';
import { saveCurrentTime } from './saveCurrentTime';

export const subscribeToAudioEvents = Fx.sync(function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  const abortController = new AbortController();
  const signal = abortController.signal;

  audio.addEventListener(
    'ended',
    () =>
      goToNextSong()
        .runAsync({ store })
        .then(result => result.assertOk()),
    { signal },
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

    { signal },
  );

  audio.addEventListener(
    'durationchange',
    () => {
      store.setState(prevState => ({
        player: {
          ...prevState.player,
          duration: isFinite(audio.duration) ? audio.duration : undefined,
        },
      }));
    },
    { signal },
  );

  audio.addEventListener(
    'pause',
    () => {
      store.setState(prevState => ({
        player: { ...prevState.player, paused: true },
      }));
    },
    { signal },
  );

  audio.addEventListener(
    'play',
    () => {
      store.setState(prevState => ({
        player: { ...prevState.player, paused: false },
      }));
    },
    { signal },
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

      saveCurrentTime(store);
    },
    { signal },
  );

  store.setState(prevState => ({
    player: {
      ...prevState.player,
      currentTime: audio.currentTime,
      paused: audio.paused,
      duration: isFinite(audio.duration) ? audio.duration : undefined,
      muted: audio.muted,
      volume: audio.volume,
    },
  }));

  const interval = setInterval(() => {
    if (!audio.src) return;

    const buffered = new Array<TimeRange>(audio.buffered.length);

    for (let i = 0; i < audio.buffered.length; i++) {
      buffered[i] = {
        start: audio.buffered.start(i),
        end: audio.buffered.end(i),
      };
    }

    const { player } = store.getState();

    if (!deepEqual(buffered, player.buffered)) {
      store.setState({ player: { ...player, buffered } });
    }
  }, 500);

  return Fx.Ok(() => {
    clearInterval(interval);
    abortController.abort();
  });
});
