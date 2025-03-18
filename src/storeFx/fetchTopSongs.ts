import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetTopSongs } from '../api/subsonic/methods/getTopSongs';
import type { AppStore } from '../store/create';

export const fetchTopSongs = Fx.async(async function* f(artistName: string) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;

  const songs =
    (yield* subsonicGetTopSongs(artistName).provide({ credentials })) ?? [];

  const topSongIdsByArtistName = mergeIntoMap(
    store.getState().artists.topSongIdsByArtistName,
    [songs.map(song => song.id)],
    () => artistName,
  );

  const songsById = mergeIntoMap(store.getState().songs.byId, songs, x => x.id);

  if (
    topSongIdsByArtistName !==
      store.getState().artists.topSongIdsByArtistName ||
    songsById !== store.getState().songs.byId
  ) {
    store.setState(prevState => ({
      artists: {
        ...prevState.artists,
        topSongIdsByArtistName,
      },
      songs: {
        ...prevState.songs,
        byId: songsById,
      },
    }));
  }

  return Fx.Ok();
});
