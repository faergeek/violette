import { invariant } from '@tanstack/react-router';
import type { StateCreator } from 'zustand';

import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetSong } from '../api/subsonic';
import type { Song } from '../api/types';
import type { StoreState } from '../store/create';

export interface SongsSlice {
  byId: Map<string, Song>;
  fetchOne: (id: string) => Promise<void>;
}

export const songsSlice: StateCreator<StoreState, [], [], SongsSlice> = (
  set,
  get,
): SongsSlice => ({
  byId: new Map(),
  async fetchOne(id: string) {
    const { credentials } = get().auth;
    invariant(credentials);

    const song = await subsonicGetSong(id)
      .runAsync({ credentials })
      .then(result => result.assertOk());

    const byId = mergeIntoMap(get().songs.byId, [song], x => x.id);
    if (byId === get().songs.byId) return;

    set(prevState => ({ songs: { ...prevState.songs, byId } }));
  },
});
