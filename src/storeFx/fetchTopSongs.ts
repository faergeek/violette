import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import { getTopSongs } from '../subsonic';

export function fetchTopSongs(artistName: string) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
    return Fx.bind(
      Fx.provide(getTopSongs(artistName), {
        credentials: store.getState().auth.credentials,
      }),
      songs => {
        songs ??= [];

        const state = store.getState();

        const topSongIdsByArtistName = mergeIntoMap(
          state.artists.topSongIdsByArtistName,
          [songs.map(song => song.id)],
          () => artistName,
        );

        const songsById = mergeIntoMap(
          state.songs.byId,
          songs,
          song => song.id,
        );

        if (
          topSongIdsByArtistName !== state.artists.topSongIdsByArtistName ||
          songsById !== state.songs.byId
        ) {
          store.setState(prevState => ({
            artists: { ...prevState.artists, topSongIdsByArtistName },
            songs: { byId: songsById },
          }));
        }

        return Fx.Ok();
      },
    );
  });
}
