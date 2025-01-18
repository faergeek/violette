import type { StateCreator } from 'zustand';

import type { ArtistInfo } from '../api/subsonic/types/artistInfo';
import type { BaseArtist } from '../api/subsonic/types/baseArtist';
import type { StoreState } from '../store/create';

export type SimilarArtist =
  | { present: true; id: string }
  | { present: false; name: string };

export interface ArtistsSlice {
  albumIdsByArtistId: Map<string, string[]>;
  artistInfoById: Map<string, Omit<ArtistInfo, 'similarArtist'>>;
  byId: Map<string, BaseArtist>;
  listIds?: string[];
  similarArtistsById: Map<string, SimilarArtist[]>;
  topSongIdsByArtistName: Map<string, string[]>;
}

export const artistsSlice: StateCreator<
  StoreState,
  [],
  [],
  ArtistsSlice
> = (): ArtistsSlice => ({
  albumIdsByArtistId: new Map(),
  artistInfoById: new Map(),
  byId: new Map(),
  similarArtistsById: new Map(),
  topSongIdsByArtistName: new Map(),
});
