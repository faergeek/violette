import { Result } from '@faergeek/monads';
import { invariant } from '@tanstack/react-router';
import { deepEqual } from 'fast-equals';
import * as v from 'valibot';
import type { StateCreator } from 'zustand';

import { getLocalStorageValue } from '../_core/localStorage';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { throttle } from '../_core/throttle';
import {
  subsonicGetCoverArtUrl,
  subsonicGetPlayQueue,
  subsonicGetStreamUrl,
  subsonicSavePlayQueue,
  subsonicScrobble,
} from '../api/subsonic';
import type { SubsonicCredentials } from '../api/types';
import type { StoreState } from '../store/create';

const REPLAY_GAIN_LOCAL_STORAGE_KEY = 'replayGain';

export enum PreferredGain {
  Album = 'album',
  Track = 'track',
}

const ReplayGainOptions = v.object({
  preAmp: v.number(),
  preferredGain: v.optional(v.enum(PreferredGain)),
});

type ReplayGainOptions = v.InferInput<typeof ReplayGainOptions>;

interface TimeRange {
  start: number;
  end: number;
}

export interface PlayerSlice {
  buffered: TimeRange[];
  currentSongId?: string;
  currentTime: number;
  duration: number | undefined;
  goToNextSong: () => void;
  goToPrevSong: () => void;
  init(credentials: SubsonicCredentials): Promise<void>;
  isInitialized: boolean;
  muted: boolean;
  paused: boolean;
  queuedSongIds: string[];
  replayGainOptions: ReplayGainOptions;
  setCurrentTime: (
    currentTime: number | ((currentTime: number) => number),
  ) => void;
  setReplayGainOptions(
    replayGain:
      | ReplayGainOptions
      | ((replayGain: ReplayGainOptions) => ReplayGainOptions),
  ): void;
  setVolume: (volume: number | ((volume: number) => number)) => void;
  startPlaying(songId: string, songsToQueue?: string[]): void;
  toggleMuted: () => void;
  togglePaused(paused?: boolean): void;
  volume: number;
}

export const playerSlice: StateCreator<StoreState, [], [], PlayerSlice> = (
  set,
  get,
  store,
): PlayerSlice => {
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  let audioContext: AudioContext | undefined;
  let gainValue: number | undefined;
  let gainNode: GainNode | undefined;

  function togglePaused(paused?: boolean) {
    const { player } = get();
    paused ??= !player.paused;

    if (paused) audio.pause();
    else {
      if (!audioContext) {
        audioContext = new AudioContext();
        gainNode = audioContext.createGain();
        audioContext
          .createMediaElementSource(audio)
          .connect(gainNode)
          .connect(audioContext.destination);

        if (gainValue != null) {
          gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);
        }
      }

      audio.play();
    }
  }

  async function startPlaying(
    songId: string,
    queuedSongIds = get().player.queuedSongIds,
  ) {
    const { auth } = get();
    invariant(auth.credentials);

    set(prevState => ({
      player: {
        ...prevState.player,
        currentSongId: songId,
        queuedSongIds,
      },
    }));

    togglePaused(false);

    await subsonicSavePlayQueue(queuedSongIds, songId)
      .runAsync({ credentials: auth.credentials })
      .then(result => result.assertOk());
  }

  let skipping = false;
  function setCurrentTime(
    currentTime: number | ((currentTime: number) => number),
  ) {
    const { player } = get();
    if (player.duration == null) return;

    skipping = true;

    currentTime =
      typeof currentTime === 'function'
        ? currentTime(player.currentTime)
        : currentTime;

    currentTime = Math.max(0, Math.min(currentTime, player.duration));

    if (currentTime === audio.currentTime) return;

    audio.currentTime = currentTime;
    set({ player: { ...player, currentTime } });
    saveCurrentTime.now();
  }

  setInterval(() => {
    if (!audio.src) return;

    const buffered = new Array<TimeRange>(audio.buffered.length);

    for (let i = 0; i < audio.buffered.length; i++) {
      buffered[i] = {
        start: audio.buffered.start(i),
        end: audio.buffered.end(i),
      };
    }

    const { player } = get();

    if (!deepEqual(buffered, player.buffered)) {
      set({ player: { ...player, buffered } });
    }
  }, 500);

  function goToNextSong() {
    const { player } = get();

    const currentIndex = player.queuedSongIds.findIndex(
      id => id === player.currentSongId,
    );

    const nextIndex = (currentIndex + 1) % player.queuedSongIds.length;

    startPlaying(player.queuedSongIds[nextIndex]);
  }

  function goToPrevSong() {
    const { player } = get();

    if (player.currentTime > 3) {
      setCurrentTime(0);
      togglePaused(false);
    } else {
      const currentIndex = player.queuedSongIds.findIndex(
        id => id === player.currentSongId,
      );

      const prevIndex =
        (player.queuedSongIds.length + currentIndex - 1) %
        player.queuedSongIds.length;

      startPlaying(player.queuedSongIds[prevIndex]);
    }
  }

  const saveCurrentTime = throttle(5000, async () => {
    const { auth, player } = get();
    if (auth.credentials == null || player.currentSongId == null) return;

    await subsonicSavePlayQueue(player.queuedSongIds, player.currentSongId, {
      position: Math.floor(audio.currentTime * 1000),
    }).runAsync({ credentials: auth.credentials });
  });

  audio.addEventListener('ended', goToNextSong);

  audio.addEventListener('emptied', () => {
    set(prevState => ({
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
  });

  audio.addEventListener('durationchange', () => {
    set(prevState => ({
      player: {
        ...prevState.player,
        duration: isFinite(audio.duration) ? audio.duration : undefined,
      },
    }));
  });

  audio.addEventListener('pause', () => {
    set(prevState => ({
      player: { ...prevState.player, paused: true },
    }));
  });

  audio.addEventListener('play', () => {
    set(prevState => ({
      player: { ...prevState.player, paused: false },
    }));
  });

  audio.addEventListener('timeupdate', () => {
    set(prevState => ({
      player: {
        ...prevState.player,
        currentTime: audio.currentTime,
      },
    }));

    saveCurrentTime();
  });

  audio.addEventListener('volumechange', () => {
    set(prevState => ({
      player: {
        ...prevState.player,
        muted: audio.muted,
        volume: audio.volume,
      },
    }));
  });

  navigator.mediaSession.setActionHandler('play', () => togglePaused(false));
  navigator.mediaSession.setActionHandler('pause', () => togglePaused(true));

  navigator.mediaSession.setActionHandler('stop', () => {
    togglePaused(true);
    setCurrentTime(0);
  });

  navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => {
    if (seekTime == null) return;
    setCurrentTime(seekTime);
  });

  navigator.mediaSession.setActionHandler('seekforward', ({ seekOffset }) => {
    if (seekOffset == null) return;
    setCurrentTime(currentTime => currentTime + seekOffset);
  });

  navigator.mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => {
    if (seekOffset == null) return;
    setCurrentTime(currentTime => currentTime - seekOffset);
  });

  navigator.mediaSession.setActionHandler('previoustrack', goToPrevSong);
  navigator.mediaSession.setActionHandler('nexttrack', goToNextSong);

  let timePlayed = 0;
  store.subscribe((state, prevState) => {
    const { auth, player, songs } = state;

    if (
      (player.currentTime !== prevState.player.currentTime ||
        player.duration !== prevState.player.duration) &&
      player.duration != null
    ) {
      navigator.mediaSession.setPositionState({
        duration: player.duration,
        position: Math.min(player.currentTime, player.duration),
      });
    }

    if (
      player.currentSongId === prevState.player.currentSongId &&
      player.currentTime !== prevState.player.currentTime
    ) {
      if (skipping) {
        skipping = false;
      } else if (player.currentTime > prevState.player.currentTime) {
        timePlayed += player.currentTime - prevState.player.currentTime;
      }
    }

    if (
      auth.credentials !== prevState.auth.credentials ||
      player.currentSongId !== prevState.player.currentSongId
    ) {
      const src =
        auth.credentials == null || player.currentSongId == null
          ? ''
          : subsonicGetStreamUrl(auth.credentials, player.currentSongId);

      if (audio.src !== src) audio.src = src;
    }

    const song = player.currentSongId
      ? songs.byId.get(player.currentSongId)
      : undefined;

    if (player.currentSongId !== prevState.player.currentSongId) {
      const { credentials } = auth;
      const metadata = new MediaMetadata();

      if (credentials && song) {
        metadata.album = song.album;
        metadata.artist = song.artist;
        metadata.title = song.title;

        metadata.artwork = [96, 128, 192, 256, 384, undefined].map(
          (size): MediaImage => ({
            src: subsonicGetCoverArtUrl(credentials, song.coverArt, { size }),
            sizes: size == null ? '' : `${size}x${size}`,
          }),
        );
      }

      navigator.mediaSession.metadata = metadata;
    }

    if (
      player.currentSongId !== prevState.player.currentSongId ||
      player.replayGainOptions !== prevState.player.replayGainOptions
    ) {
      const replayGain = song?.replayGain ?? {};
      const { albumGain, albumPeak, trackGain, trackPeak } = replayGain;

      // https://wiki.hydrogenaud.io/index.php?title=ReplayGain_2.0_specification#Player_requirements
      const gain =
        player.replayGainOptions.preferredGain == null
          ? 0
          : ({
              [PreferredGain.Album]: albumGain ?? trackGain,
              [PreferredGain.Track]: trackGain ?? albumGain,
            }[player.replayGainOptions.preferredGain] ?? 0);

      const peak =
        player.replayGainOptions.preferredGain == null
          ? 1
          : ({
              [PreferredGain.Album]: albumPeak ?? trackPeak,
              [PreferredGain.Track]: trackPeak ?? albumPeak,
            }[player.replayGainOptions.preferredGain] ?? 1);

      gainValue = Math.min(
        10 ** ((gain + player.replayGainOptions.preAmp) / 20),
        1 / peak,
      );

      if (audioContext && gainNode) {
        gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);
      }
    }

    if (
      auth.credentials != null &&
      player.currentSongId != null &&
      !player.paused &&
      (player.currentSongId !== prevState.player.currentSongId ||
        player.paused !== prevState.player.paused)
    ) {
      subsonicScrobble(player.currentSongId, { submission: false }).runAsync({
        credentials: auth.credentials,
      });
    }

    if (
      player.currentSongId !== prevState.player.currentSongId &&
      prevState.player.currentSongId != null
    ) {
      if (
        auth.credentials != null &&
        prevState.player.duration != null &&
        prevState.player.duration >= 30 &&
        // https://www.last.fm/api/scrobbling#when-is-a-scrobble-a-scrobble
        (timePlayed / prevState.player.duration >= 0.5 || timePlayed >= 4 * 60)
      ) {
        subsonicScrobble(prevState.player.currentSongId).runAsync({
          credentials: auth.credentials,
        });
      }

      timePlayed = 0;
    }
  });

  return {
    buffered: [],
    currentTime: 0,
    duration: undefined,
    goToNextSong,
    goToPrevSong,
    async init(credentials) {
      if (!credentials || get().player.isInitialized) return;

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
        setCurrentTime((playQueue?.position ?? 0) / 1000);
      }

      set(prevState => ({
        player: {
          ...prevState.player,
          currentSongId,
          isInitialized: true,
          queuedSongIds: playQueue?.entry.map(song => song.id) ?? [],
        },
        songs: {
          ...prevState.songs,
          byId: playQueue?.entry
            ? mergeIntoMap(get().songs.byId, playQueue.entry, x => x.id)
            : get().songs.byId,
        },
      }));
    },
    isInitialized: false,
    muted: false,
    paused: true,
    queuedSongIds: [],
    replayGainOptions: getLocalStorageValue(
      REPLAY_GAIN_LOCAL_STORAGE_KEY,
      ReplayGainOptions,
    ).getOr(() => ({ preAmp: 0 })),
    setCurrentTime,
    setReplayGainOptions(replayGainOptions) {
      const { player } = get();

      replayGainOptions =
        typeof replayGainOptions === 'function'
          ? replayGainOptions(player.replayGainOptions)
          : replayGainOptions;

      replayGainOptions = {
        ...replayGainOptions,
        preAmp: Math.max(-15, Math.min(replayGainOptions.preAmp, 15)),
      };

      set(prevState => ({
        player: {
          ...prevState.player,
          replayGainOptions,
        },
      }));

      localStorage.setItem(
        REPLAY_GAIN_LOCAL_STORAGE_KEY,
        JSON.stringify(replayGainOptions),
      );
    },
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
    togglePaused,
    volume: 1,
  };
};
