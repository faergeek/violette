import type { StoreApi } from 'zustand';
import { createStore } from 'zustand';

import type { AlbumsSlice } from '../slices/albums';
import { albumsSlice } from '../slices/albums';
import type { ArtistsSlice } from '../slices/artists';
import { artistsSlice } from '../slices/artists';
import type { AuthSlice } from '../slices/auth';
import { authSlice } from '../slices/auth';
import type { PlayerSlice } from '../slices/player';
import { playerSlice } from '../slices/player';
import type { SongsSlice } from '../slices/songs';
import { songsSlice } from '../slices/songs';

export interface StoreState {
  albums: AlbumsSlice;
  artists: ArtistsSlice;
  auth: AuthSlice;
  player: PlayerSlice;
  songs: SongsSlice;
}

export type AppStore = StoreApi<StoreState>;

export function createAppStore() {
  return createStore<StoreState>()(
    (set, get, store): StoreState => ({
      albums: albumsSlice(set, get, store),
      artists: artistsSlice(set, get, store),
      auth: authSlice(set, get, store),
      player: playerSlice(set, get, store),
      songs: songsSlice(set, get, store),
    }),
  );
}
