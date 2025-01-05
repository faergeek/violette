import * as v from 'valibot';

import type { BaseSong, SubsonicCredentials } from '../api/types';

export enum PreferredGain {
  Album = 'album',
  Track = 'track',
}

export const ReplayGainSettings = v.object({
  preAmp: v.number(),
  preferredGain: v.optional(v.enum(PreferredGain)),
});

export type ReplayGainSettings = v.InferInput<typeof ReplayGainSettings>;

export interface StoreMutations {
  clearSubsonicCredentials: () => void;
  goToNextSong: () => void;
  goToPrevSong: () => void;
  saveSubsonicCredentials: (credentials: SubsonicCredentials) => void;
  setAudioCurrentTime: (
    currentTime: number | ((currentTime: number) => number),
  ) => void;
  setReplayGainSettings(
    replayGainSettings:
      | ReplayGainSettings
      | ((replayGainSettings: ReplayGainSettings) => ReplayGainSettings),
  ): void;
  setVolume: (volume: number | ((volume: number) => number)) => void;
  startPlaying(song: BaseSong, songsToQueue?: BaseSong[]): void;
  toggleMuted: () => void;
  togglePaused(paused?: boolean): void;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AudioState {
  buffered: TimeRange[];
  currentTime: number;
  duration: number | undefined;
  muted: boolean;
  paused: boolean;
  volume: number;
}

export interface StoreState {
  audioState: AudioState;
  credentials: SubsonicCredentials | undefined;
  currentSongId?: string;
  queuedSongs: BaseSong[];
  replayGainSettings: ReplayGainSettings;

  mutations: StoreMutations;
}
