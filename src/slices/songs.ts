import type { StateCreator } from 'zustand';

import type { Song } from '../api/subsonic/types/song';
import type { StoreState } from '../store/create';

export interface SongsSlice {
  byId: Map<string, Song>;
}

export const songsSlice: StateCreator<
  StoreState,
  [],
  [],
  SongsSlice
> = (): SongsSlice => ({
  byId: new Map(),
});
