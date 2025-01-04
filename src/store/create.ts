import { Result } from '@faergeek/monads';
import { deepEqual } from 'fast-equals';
import invariant from 'tiny-invariant';
import * as v from 'valibot';
import { createStore } from 'zustand';

import { throttle } from '../_core/throttle';
import {
  subsonicGetCoverArtUrl,
  subsonicGetPlayQueue,
  subsonicGetStreamUrl,
  subsonicSavePlayQueue,
  subsonicScrobble,
} from '../api/subsonic';
import type { BaseSong } from '../api/types';
import { SubsonicCredentials } from '../api/types';
import type { StoreState, TimeRange } from './types';

const CREDENTIALS_LOCAL_STORAGE_KEY = 'subsonic-credentials';

export function createAppStore() {
  return createStore<StoreState>()((set, get, store): StoreState => {
    const credentialsParseResult = v.safeParse(
      SubsonicCredentials,
      JSON.parse(String(localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_KEY))),
    );

    let skipping = false;
    const audio = new Audio();

    const saveAudioCurrentTime = throttle(5000, async () => {
      const { credentials, currentSongId, queuedSongs } = get();
      if (credentials == null || currentSongId == null) return;

      await subsonicSavePlayQueue(
        queuedSongs.map(song => song.id),
        currentSongId,
        { position: Math.floor(audio.currentTime * 1000) },
      ).runAsync({ credentials });
    });

    setInterval(() => {
      if (!audio.src) return;

      const buffered = new Array<TimeRange>(audio.buffered.length);

      for (let i = 0; i < audio.buffered.length; i++) {
        buffered[i] = {
          start: audio.buffered.start(i),
          end: audio.buffered.end(i),
        };
      }

      const prevState = get();

      if (!deepEqual(buffered, prevState.audioState.buffered)) {
        set({
          audioState: {
            ...prevState.audioState,
            buffered,
          },
        });
      }
    }, 100);

    function setAudioCurrentTime(
      currentTime: number | ((currentTime: number) => number),
    ) {
      skipping = true;
      const { audioState } = get();
      currentTime =
        typeof currentTime === 'function'
          ? currentTime(audioState.currentTime)
          : currentTime;

      if (currentTime === audio.currentTime) return;

      audio.currentTime = currentTime;
      set({ audioState: { ...audioState, currentTime } });
      saveAudioCurrentTime.now();
    }

    const initialCredentials = credentialsParseResult.success
      ? credentialsParseResult.output
      : undefined;

    async function initializePlaybackState() {
      const { credentials = initialCredentials } = get() ?? {};
      if (!credentials) return;

      const playQueue = await subsonicGetPlayQueue()
        .runAsync({ credentials })
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

      if (currentSongId != null) {
        setAudioCurrentTime((playQueue?.position ?? 0) / 1000);
      }

      set({
        currentSongId,
        queuedSongs: playQueue?.entry ?? [],
      });
    }

    initializePlaybackState();

    async function startPlaying(song: BaseSong, songsToQueue?: BaseSong[]) {
      const state = get();
      invariant(state.credentials);

      const queuedSongs = songsToQueue ?? state.queuedSongs;
      const currentSongId = song.id;
      set({ currentSongId, queuedSongs });

      audio.play();

      await subsonicSavePlayQueue(
        queuedSongs.map(s => s.id),
        currentSongId,
      )
        .runAsync({ credentials: state.credentials })
        .then(result => result.assertOk());
    }

    function goToNextSong() {
      const state = get();
      const currentIndex = state.queuedSongs.findIndex(
        s => s.id === state.currentSongId,
      );

      const nextIndex = (currentIndex + 1) % state.queuedSongs.length;
      const nextSong = state.queuedSongs[nextIndex];

      startPlaying(nextSong);
    }

    function goToPrevSong() {
      const state = get();

      if (state.audioState.currentTime > 3) {
        setAudioCurrentTime(0);
        audio.play();
      } else {
        const currentIndex = state.queuedSongs.findIndex(
          s => s.id === state.currentSongId,
        );

        const prevIndex =
          (state.queuedSongs.length + currentIndex - 1) %
          state.queuedSongs.length;

        const prevSong = state.queuedSongs[prevIndex];

        startPlaying(prevSong);
      }
    }

    audio.addEventListener('ended', goToNextSong);

    audio.addEventListener('emptied', () => {
      set(prevState => ({
        audioState: {
          buffered: [],
          currentTime: 0,
          duration: undefined,
          muted: prevState.audioState.muted,
          paused: true,
          volume: prevState.audioState.volume,
        },
      }));
    });

    audio.addEventListener('durationchange', () => {
      set(prevState => ({
        audioState: {
          ...prevState.audioState,
          duration: isFinite(audio.duration) ? audio.duration : undefined,
        },
      }));
    });

    audio.addEventListener('pause', () => {
      set(prevState => ({
        audioState: { ...prevState.audioState, paused: true },
      }));
    });

    audio.addEventListener('play', () => {
      set(prevState => ({
        audioState: { ...prevState.audioState, paused: false },
      }));
    });

    audio.addEventListener('timeupdate', () => {
      set(prevState => ({
        audioState: { ...prevState.audioState, currentTime: audio.currentTime },
      }));

      saveAudioCurrentTime();
    });

    audio.addEventListener('volumechange', () =>
      set(prevState => ({
        audioState: {
          ...prevState.audioState,
          muted: audio.muted,
          volume: audio.volume,
        },
      })),
    );

    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());

    navigator.mediaSession.setActionHandler('stop', () => {
      audio.pause();
      setAudioCurrentTime(0);
    });

    navigator.mediaSession.setActionHandler('previoustrack', goToPrevSong);
    navigator.mediaSession.setActionHandler('nexttrack', goToNextSong);

    let timePlayed = 0;
    store.subscribe((state, prevState) => {
      const { credentials, currentSongId, audioState } = state;

      if (
        currentSongId === prevState.currentSongId &&
        audioState.currentTime !== prevState.audioState.currentTime
      ) {
        if (skipping) {
          skipping = false;
        } else if (audioState.currentTime > prevState.audioState.currentTime) {
          timePlayed +=
            audioState.currentTime - prevState.audioState.currentTime;
        }
      }

      if (
        credentials !== prevState.credentials ||
        currentSongId !== prevState.currentSongId
      ) {
        const src =
          credentials == null || currentSongId == null
            ? ''
            : subsonicGetStreamUrl(credentials, currentSongId);

        if (audio.src !== src) audio.src = src;
      }

      if (credentials && currentSongId !== prevState.currentSongId) {
        const { queuedSongs } = state;
        const song = queuedSongs.find(s => s.id === currentSongId);

        if (song) {
          const artwork = (size?: number) => {
            const result: MediaImage = {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt, {
                size,
              }),
            };

            if (size != null) {
              result.sizes = `${size}x${size}`;
            }

            return result;
          };

          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album,
            artwork: [
              artwork(96),
              artwork(128),
              artwork(192),
              artwork(256),
              artwork(384),
              artwork(),
            ],
          });
        }
      }

      if (
        credentials != null &&
        currentSongId != null &&
        !audioState.paused &&
        (currentSongId !== prevState.currentSongId ||
          audioState.paused !== prevState.audioState.paused)
      ) {
        subsonicScrobble(currentSongId, { submission: false }).runAsync({
          credentials,
        });
      }

      if (
        currentSongId !== prevState.currentSongId &&
        prevState.currentSongId != null
      ) {
        if (
          credentials != null &&
          prevState.audioState.duration != null &&
          prevState.audioState.duration >= 30 &&
          // https://www.last.fm/api/scrobbling#when-is-a-scrobble-a-scrobble
          (timePlayed / prevState.audioState.duration >= 0.5 ||
            timePlayed >= 4 * 60)
        ) {
          subsonicScrobble(prevState.currentSongId).runAsync({ credentials });
        }

        timePlayed = 0;
      }
    });

    return {
      audioState: {
        buffered: [],
        currentTime: 0,
        duration: undefined,
        muted: false,
        paused: true,
        volume: 1,
      },
      credentials: initialCredentials,
      queuedSongs: [],

      mutations: {
        clearSubsonicCredentials() {
          localStorage.removeItem(CREDENTIALS_LOCAL_STORAGE_KEY);
          set({ credentials: undefined });
        },
        goToNextSong,
        goToPrevSong,
        saveSubsonicCredentials(newCredentials) {
          localStorage.setItem(
            CREDENTIALS_LOCAL_STORAGE_KEY,
            JSON.stringify(newCredentials),
          );

          set({ credentials: newCredentials });
          initializePlaybackState();
        },
        setAudioCurrentTime,
        setVolume(volume) {
          audio.muted = false;
          audio.volume = Math.max(
            0,
            Math.min(
              typeof volume === 'function' ? volume(audio.volume) : volume,
              1,
            ),
          );
        },
        startPlaying,
        toggleMuted() {
          audio.muted = !audio.muted;

          if (!audio.muted && audio.volume === 0) {
            audio.volume = 0.5;
          }
        },
        togglePaused(paused?: boolean) {
          paused ??= !get().audioState.paused;

          if (paused) audio.pause();
          else audio.play();
        },
      },
    };
  });
}
