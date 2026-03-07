import * as Fx from '../fx/fx';
import type { Store } from '../store/types.js';
import { getCoverArt, scrobble, streamUrl } from '../subsonic';
import { initializePlayQueue } from './initializePlayQueue';
import { audio, replayGainValue, skipping, value } from './playerContext';

const timePlayed = { contents: 0 };

export function subscribeToStoreStateUpdates() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    store.subscribe((state, prevState) => {
      if (
        state.player.currentTime !== prevState.player.currentTime ||
        state.player.duration !== prevState.player.duration
      ) {
        const duration = state.player.duration;

        if (duration != null) {
          navigator.mediaSession.setPositionState({
            duration,
            position: Math.min(state.player.currentTime, duration),
          });
        }
      }

      if (
        state.player.currentSongId === prevState.player.currentSongId &&
        state.player.currentTime !== prevState.player.currentTime
      ) {
        if (skipping.contents) {
          skipping.contents = false;
        } else if (state.player.currentTime > prevState.player.currentTime) {
          timePlayed.contents +=
            state.player.currentTime - prevState.player.currentTime;
        }
      }

      if (
        state.auth.credentials !== prevState.auth.credentials ||
        state.player.currentSongId !== prevState.player.currentSongId
      ) {
        const src =
          state.auth.credentials != null && state.player.currentSongId != null
            ? streamUrl(state.auth.credentials, state.player.currentSongId)
            : '';

        if (audio.src !== src) audio.src = src;
      }

      const song =
        state.player.currentSongId == null
          ? undefined
          : state.songs.byId.get(state.player.currentSongId);

      if (state.player.currentSongId !== prevState.player.currentSongId) {
        const credentials = state.auth.credentials;
        const metadata = new MediaMetadata();

        if (credentials != null && song != null) {
          metadata.album = song.album;
          metadata.artist = song.artist;
          metadata.title = song.title;

          metadata.artwork = [96, 128, 192, 256, 384, undefined].map(size => ({
            sizes: size == null ? '' : `${size}x${size}`,
            src: getCoverArt(credentials, song.coverArt, size),
          }));
        }

        navigator.mediaSession.metadata = metadata;
      }

      if (
        state.player.currentSongId !== prevState.player.currentSongId ||
        state.player.replayGainOptions !== prevState.player.replayGainOptions
      ) {
        const { albumGain, albumPeak, trackGain, trackPeak } =
          song?.replayGain ?? {};

        const { preAmp, preferredGain } = state.player.replayGainOptions;

        const gain =
          preferredGain === 'album'
            ? (albumGain ?? trackGain)
            : (trackGain ?? albumGain);

        const peak =
          preferredGain === 'album'
            ? (albumPeak ?? trackPeak)
            : (trackPeak ?? albumPeak);

        const newReplayGainValue = Math.min(
          Math.pow(10, ((gain ?? 0) + preAmp) / 20),
          1 / (peak ?? 1),
        );

        replayGainValue.contents = newReplayGainValue;

        if (value.contents) {
          const { audioContext, replayGainNode } = value.contents;

          replayGainNode.gain.setValueAtTime(
            newReplayGainValue,
            audioContext.currentTime,
          );
        }
      }

      if (
        state.auth.credentials != null &&
        state.player.currentSongId != null &&
        !state.player.paused &&
        (state.player.currentSongId !== prevState.player.currentSongId ||
          state.player.paused !== prevState.player.paused)
      ) {
        Fx.runAsync(scrobble(state.player.currentSongId, false), {
          credentials: state.auth.credentials,
        });
      }

      if (
        state.player.currentSongId != null &&
        prevState.player.currentSongId != null
      ) {
        if (state.player.currentSongId !== prevState.player.currentSongId) {
          if (
            state.auth.credentials != null &&
            prevState.player.duration != null
          ) {
            if (
              prevState.player.duration >= 30 &&
              (timePlayed.contents / prevState.player.duration >= 0.5 ||
                timePlayed.contents >= 4 * 60)
            ) {
              Fx.runAsync(scrobble(prevState.player.currentSongId), {
                credentials: state.auth.credentials,
              });
            }

            timePlayed.contents = 0;
          }
        }
      }
    });

    return initializePlayQueue();
  });
}
