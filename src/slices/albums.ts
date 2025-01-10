import { invariant } from '@tanstack/react-router';
import type { StateCreator } from 'zustand';

import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetAlbum, subsonicGetAlbumInfo } from '../api/subsonic';
import type {
  AlbumInfo,
  BaseAlbum,
  DiscTitle,
  ReleaseDate,
} from '../api/types';
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
  fetchInfo(albumId: string): Promise<void>;
  fetchOne(albumId: string): Promise<void>;
  infoById: Map<string, AlbumInfo>;
  songIdsById: Map<string, string[]>;
}

export const albumsSlice: StateCreator<StoreState, [], [], AlbumsSlice> = (
  set,
  get,
): AlbumsSlice => ({
  baseById: new Map(),
  detailsById: new Map(),
  async fetchInfo(albumId) {
    const { credentials } = get().auth;
    invariant(credentials);

    const albumInfo = await subsonicGetAlbumInfo(albumId)
      .runAsync({ credentials })
      .then(result => result.assertOk());

    const infoById = mergeIntoMap(
      get().albums.infoById,
      [albumInfo],
      () => albumId,
    );

    if (infoById === get().albums.infoById) return;

    set(prevState => ({ albums: { ...prevState.albums, infoById } }));
  },
  async fetchOne(albumId) {
    const { credentials } = get().auth;
    invariant(credentials);

    const {
      artist,
      artistId,
      coverArt,
      discTitles,
      duration,
      genre,
      genres,
      id,
      isCompilation,
      musicBrainzId,
      name,
      originalReleaseDate,
      releaseDate,
      song,
      songCount,
      starred,
      userRating,
      year,
    } = await subsonicGetAlbum(albumId)
      .runAsync({ credentials })
      .then(result => result.assertOk());

    const baseById = mergeIntoMap(
      get().albums.baseById,
      [
        {
          artist,
          artistId,
          coverArt,
          duration,
          genre,
          genres,
          id,
          musicBrainzId,
          name,
          songCount,
          starred,
          userRating,
          year,
        },
      ],
      () => albumId,
    );

    const detailsById = mergeIntoMap(
      get().albums.detailsById,
      [
        {
          discTitles,
          isCompilation,
          originalReleaseDate,
          releaseDate,
        },
      ],
      () => albumId,
    );

    const songIdsById = mergeIntoMap(
      get().albums.songIdsById,
      [song.map(x => x.id)],
      () => albumId,
    );

    const songsById = mergeIntoMap(get().songs.byId, song, x => x.id);

    if (
      baseById === get().albums.baseById &&
      detailsById === get().albums.detailsById &&
      songIdsById === get().albums.songIdsById &&
      songsById === get().songs.byId
    ) {
      return;
    }

    set(prevState => ({
      albums: {
        ...prevState.albums,
        baseById,
        detailsById,
        songIdsById,
      },
      songs: {
        ...prevState.songs,
        byId: songsById,
      },
    }));
  },
  infoById: new Map(),
  songIdsById: new Map(),
});
