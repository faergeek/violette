import { invariant } from '@tanstack/react-router';
import type { StoreApi } from 'zustand';
import { createStore } from 'zustand';

import { subsonicStar, subsonicUnstar } from '../api/subsonic';
import type { StarParams } from '../api/types';
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
  star: (params: StarParams) => Promise<void>;
  unstar: (params: StarParams) => Promise<void>;
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
      async star(params) {
        const { credentials } = get().auth;
        invariant(credentials);

        await subsonicStar(params)
          .runAsync({ credentials })
          .then(result => result.assertOk());

        if (params.albumId != null) {
          await get().albums.fetchOne(params.albumId);
        } else if (params.artistId != null) {
          await get().artists.fetchOne(params.artistId);
        } else {
          await get().songs.fetchOne(params.id);
        }
      },
      async unstar(params) {
        const { credentials } = get().auth;
        invariant(credentials);

        await subsonicUnstar(params)
          .runAsync({ credentials })
          .then(result => result.assertOk());

        if (params.albumId != null) {
          await get().albums.fetchOne(params.albumId);
        } else if (params.artistId != null) {
          await get().artists.fetchOne(params.artistId);
        } else {
          await get().songs.fetchOne(params.id);
        }
      },
    }),
  );
}
