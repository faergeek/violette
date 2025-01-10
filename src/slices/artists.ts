import { deepEqual, invariant } from '@tanstack/react-router';
import type { StateCreator } from 'zustand';

import { mergeIntoMap } from '../_core/mergeIntoMap';
import {
  subsonicGetArtist,
  subsonicGetArtistInfo,
  subsonicGetArtists,
  subsonicGetTopSongs,
} from '../api/subsonic';
import type { ArtistInfo, BaseArtist } from '../api/types';
import type { StoreState } from '../store/create';

export type SimilarArtist =
  | { present: true; id: string }
  | { present: false; name: string };

export interface ArtistsSlice {
  albumIdsByArtistId: Map<string, string[]>;
  artistInfoById: Map<string, Omit<ArtistInfo, 'similarArtist'>>;
  byId: Map<string, BaseArtist>;
  listIds?: string[];
  fetchAll: () => Promise<void>;
  fetchArtistInfo(
    artistId: string,
    params: {
      count?: number;
      includeNotPresent?: boolean;
    },
  ): Promise<void>;
  fetchOne(artistId: string): Promise<void>;
  fetchTopSongs(artistName: string): Promise<void>;
  similarArtistsById: Map<string, SimilarArtist[]>;
  topSongIdsByArtistName: Map<string, string[]>;
}

export const artistsSlice: StateCreator<StoreState, [], [], ArtistsSlice> = (
  set,
  get,
): ArtistsSlice => ({
  albumIdsByArtistId: new Map(),
  artistInfoById: new Map(),
  byId: new Map(),
  async fetchAll() {
    const { credentials } = get().auth;
    invariant(credentials);

    const artists = await subsonicGetArtists()
      .runAsync({ credentials })
      .then(result => result.assertOk().index.flatMap(entry => entry.artist));

    const byId = mergeIntoMap(get().artists.byId, artists, x => x.id);
    const listIds = artists.map(artist => artist.id);

    if (
      byId === get().artists.byId &&
      deepEqual(listIds, get().artists.listIds)
    ) {
      return;
    }

    set(prevState => ({ artists: { ...prevState.artists, byId, listIds } }));
  },
  async fetchArtistInfo(artistId, params) {
    const { credentials } = get().auth;
    invariant(credentials);

    const { similarArtist, ...artistInfo } = await subsonicGetArtistInfo(
      artistId,
      params,
    )
      .runAsync({ credentials })
      .then(result => result.assertOk());

    const artistInfoById = mergeIntoMap(
      get().artists.artistInfoById,
      [artistInfo],
      () => artistId,
    );

    const byId = similarArtist
      ? mergeIntoMap(
          get().artists.byId,
          similarArtist
            .filter(x => 'id' in x)
            .map(artist => {
              const original = get().artists.byId.get(artist.id);

              return original ? { ...artist, ...original } : artist;
            }),
          x => x.id,
        )
      : get().artists.byId;

    const similarArtistsById = mergeIntoMap(
      get().artists.similarArtistsById,
      [
        (similarArtist ?? []).map(artist =>
          'id' in artist
            ? { present: true, id: artist.id }
            : { present: false, name: artist.name },
        ) satisfies SimilarArtist[],
      ],
      () => artistId,
    );

    if (
      artistInfoById === get().artists.artistInfoById &&
      byId === get().artists.byId &&
      similarArtistsById === get().artists.similarArtistsById
    ) {
      return;
    }

    set(prevState => ({
      artists: {
        ...prevState.artists,
        artistInfoById,
        byId,
        similarArtistsById,
      },
    }));
  },
  async fetchOne(artistId) {
    const { credentials } = get().auth;
    invariant(credentials);

    const { album: albums, ...artist } = await subsonicGetArtist(artistId)
      .runAsync({ credentials })
      .then(result => result.assertOk());

    const albumBaseById = mergeIntoMap(
      get().albums.baseById,
      albums,
      x => x.id,
    );

    const albumIdsByArtistId = mergeIntoMap(
      get().artists.albumIdsByArtistId,
      [albums.map(x => x.id)],
      () => artist.id,
    );

    const byId = mergeIntoMap(get().artists.byId, [artist], x => x.id);

    if (
      albumBaseById === get().albums.baseById &&
      albumIdsByArtistId === get().artists.albumIdsByArtistId &&
      byId === get().artists.byId
    ) {
      return;
    }

    set(prevState => ({
      albums: {
        ...prevState.albums,
        baseById: albumBaseById,
      },
      artists: {
        ...prevState.artists,
        albumIdsByArtistId,
        byId,
      },
    }));
  },
  async fetchTopSongs(artistName) {
    const { auth } = get();
    invariant(auth.credentials);

    const songs = await subsonicGetTopSongs(artistName)
      .runAsync({ credentials: auth.credentials })
      .then(result => result.assertOk());

    if (!songs) return;

    const topSongIdsByArtistName = mergeIntoMap(
      get().artists.topSongIdsByArtistName,
      [songs.map(song => song.id)],
      () => artistName,
    );

    const songsById = mergeIntoMap(get().songs.byId, songs, x => x.id);

    if (
      topSongIdsByArtistName === get().artists.topSongIdsByArtistName &&
      songsById === get().songs.byId
    ) {
      return;
    }

    set(prevState => ({
      artists: {
        ...prevState.artists,
        topSongIdsByArtistName,
      },
      songs: {
        ...prevState.songs,
        byId: songsById,
      },
    }));
  },
  similarArtistsById: new Map(),
  topSongIdsByArtistName: new Map(),
});
