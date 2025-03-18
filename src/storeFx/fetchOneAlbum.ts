import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetAlbum } from '../api/subsonic/methods/getAlbum';
import type { AppStore } from '../store/create';

export const fetchOneAlbum = Fx.async(async function* f(albumId: string) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;

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
  } = yield* subsonicGetAlbum(albumId).provide({ credentials });

  const baseById = mergeIntoMap(
    store.getState().albums.baseById,
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
    store.getState().albums.detailsById,
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
    store.getState().albums.songIdsById,
    [song.map(x => x.id)],
    () => albumId,
  );

  const songsById = mergeIntoMap(store.getState().songs.byId, song, x => x.id);

  if (
    baseById !== store.getState().albums.baseById ||
    detailsById !== store.getState().albums.detailsById ||
    songIdsById !== store.getState().albums.songIdsById ||
    songsById !== store.getState().songs.byId
  ) {
    store.setState(prevState => ({
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
  }

  return Fx.Ok();
});
