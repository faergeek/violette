import * as v from 'valibot';
import type { StateCreator } from 'zustand';

import { getLocalStorageValue } from '../_core/localStorage';
import type { StoreState } from '../store/create';
import type { TimeRange } from '../storeFx/playerContext';

export const REPLAY_GAIN_LOCAL_STORAGE_KEY = 'replayGain';

export enum PreferredGain {
  Album = 'album',
  Track = 'track',
}

const ReplayGainOptions = v.object({
  preAmp: v.number(),
  preferredGain: v.optional(v.enum(PreferredGain)),
});

export type ReplayGainOptions = v.InferInput<typeof ReplayGainOptions>;

export interface PlayerSlice {
  buffered: TimeRange[];
  currentSongId?: string;
  currentTime: number;
  duration: number | undefined;
  muted: boolean;
  paused: boolean;
  queuedSongIds: string[];
  replayGainOptions: ReplayGainOptions;
  volume: number;
}

export const playerSlice: StateCreator<
  StoreState,
  [],
  [],
  PlayerSlice
> = (): PlayerSlice => {
  return {
    buffered: [],
    currentTime: 0,
    duration: undefined,
    muted: false,
    paused: true,
    queuedSongIds: [],
    replayGainOptions: getLocalStorageValue(
      REPLAY_GAIN_LOCAL_STORAGE_KEY,
      ReplayGainOptions,
    ).getOr(() => ({ preAmp: 0 })),
    volume: 1,
  };
};
