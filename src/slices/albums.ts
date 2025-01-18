import type { StateCreator } from 'zustand';

import type { AlbumInfo } from '../api/subsonic/types/albumInfo';
import type { BaseAlbum } from '../api/subsonic/types/baseAlbum';
import type { DiscTitle } from '../api/subsonic/types/discTitle';
import type { ReleaseDate } from '../api/subsonic/types/releaseDate';
import type { StoreState } from '../store/create';

interface AlbumDetails {
  discTitles?: DiscTitle[];
  isCompilation?: boolean;
  originalReleaseDate?: ReleaseDate;
  releaseDate?: ReleaseDate;
}

export interface AlbumsSlice {
  baseById: Map<string, BaseAlbum>;
  detailsById: Map<string, AlbumDetails>;
  infoById: Map<string, AlbumInfo>;
  songIdsById: Map<string, string[]>;
}

export const albumsSlice: StateCreator<
  StoreState,
  [],
  [],
  AlbumsSlice
> = (): AlbumsSlice => ({
  baseById: new Map(),
  detailsById: new Map(),
  infoById: new Map(),
  songIdsById: new Map(),
});
