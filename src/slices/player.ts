import { invariant } from '@tanstack/react-router';
import * as v from 'valibot';
import type { StateCreator } from 'zustand';

import { deepEqual } from '../_core/deepEqual';
import { getLocalStorageValue } from '../_core/localStorage';
import { throttle } from '../_core/throttle';
import { subsonicGetCoverArtUrl } from '../api/subsonic/methods/getCoverArtUrl';
import { subsonicGetStreamUrl } from '../api/subsonic/methods/getStreamUrl';
import { subsonicSavePlayQueue } from '../api/subsonic/methods/savePlayQueue';
import { subsonicScrobble } from '../api/subsonic/methods/scrobble';
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
  let volumeNode: GainNode | undefined;
  let replayGainValue: number | undefined;
  let replayGainNode: GainNode | undefined;

  function play() {
    if (!audioContext) {
      audioContext = new AudioContext();
      replayGainNode = audioContext.createGain();
      volumeNode = audioContext.createGain();
      audioContext
        .createMediaElementSource(audio)
        .connect(replayGainNode)
        .connect(volumeNode)
        .connect(audioContext.destination);

      volumeNode.gain.value = get().player.volume;

      if (replayGainValue != null) {
        replayGainNode.gain.setValueAtTime(
          replayGainValue,
          audioContext.currentTime,
        );
      }
    }

    audio.play();
  }

  function pause() {
    audio.pause();
  }

  async function startPlaying(
    songId: string,
    queuedSongIds = get().player.queuedSongIds,
  ) {
    const { credentials } = get().auth;
    invariant(credentials);

    set(prevState => ({
      player: {
        ...prevState.player,
        currentSongId: songId,
        queuedSongIds,
      },
    }));

    play();

    await subsonicSavePlayQueue(queuedSongIds, songId)
      .runAsync({ credentials })
      .then(result => result.assertOk());
  }

  let skipping = false;
  function setCurrentTime(
    currentTime: number | ((currentTime: number) => number),
  ) {
    const { player } = get();

    skipping = true;

    currentTime =
      typeof currentTime === 'function'
        ? currentTime(player.currentTime)
        : currentTime;

    currentTime = Math.max(
      0,
      Math.min(currentTime, player.duration ?? Infinity),
    );

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
      play();
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
    const { player } = get();
    const { credentials } = get().auth;
    if (credentials == null || player.currentSongId == null) return;

    await subsonicSavePlayQueue(player.queuedSongIds, player.currentSongId, {
      position: Math.floor(audio.currentTime * 1000),
    }).runAsync({ credentials });
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

  navigator.mediaSession.setActionHandler('play', play);
  navigator.mediaSession.setActionHandler('pause', pause);

  navigator.mediaSession.setActionHandler('stop', () => {
    pause();
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

      replayGainValue = Math.min(
        10 ** ((gain + player.replayGainOptions.preAmp) / 20),
        1 / peak,
      );

      if (audioContext && replayGainNode) {
        replayGainNode.gain.setValueAtTime(
          replayGainValue,
          audioContext.currentTime,
        );
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
      set(prevState => ({
        player: {
          ...prevState.player,
          volume: Math.max(
            0,
            Math.min(
              typeof volume === 'function'
                ? volume(prevState.player.volume)
                : volume,
              1,
            ),
          ),
        },
      }));

      if (!volumeNode) return;
      volumeNode.gain.value = get().player.volume;
    },
    startPlaying,
    toggleMuted() {
      set(prevState => ({
        player: {
          ...prevState.player,
          muted: !prevState.player.muted,
          volume:
            prevState.player.muted && prevState.player.volume === 0
              ? 0.5
              : prevState.player.volume,
        },
      }));

      if (volumeNode) {
        volumeNode.gain.value = get().player.muted ? 0 : get().player.volume;
      }
    },
    togglePaused(paused?: boolean) {
      const { player } = get();
      paused ??= !player.paused;

      if (paused) pause();
      else play();
    },
    volume: 1,
  };
};
