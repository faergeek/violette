import type { BaseSong, SubsonicCredentials } from '../api/types';

export interface StoreMutations {
  clearSubsonicCredentials: () => void;
  saveSubsonicCredentials: (credentials: SubsonicCredentials) => void;
}

export interface StoreState {
  audio: HTMLAudioElement;
  credentials: SubsonicCredentials | undefined;
  currentSongId?: string;
  paused: boolean;
  queuedSongs: BaseSong[];
  mutations: StoreMutations;
}
