import type { BaseSong, SubsonicCredentials } from '../api/types';

export interface StoreMutations {
  clearSubsonicCredentials: () => void;
  goToNextSong: () => void;
  goToPrevSong: () => void;
  saveSubsonicCredentials: (credentials: SubsonicCredentials) => void;
  setAudioCurrentTime: (
    currentTime: number | ((currentTime: number) => number),
  ) => void;
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
  mutations: StoreMutations;
}
