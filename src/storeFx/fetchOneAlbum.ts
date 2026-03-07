import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import { getAlbum } from '../subsonic';

export function make(albumId: string) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(getAlbum(albumId), {
        credentials: store.getState().auth.credentials,
      }),
      ({
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
      }) => {
        const state = store.getState();

        const baseById = mergeIntoMap(
          state.albums.baseById,
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
          state.albums.detailsById,
          [{ discTitles, isCompilation, originalReleaseDate, releaseDate }],
          () => albumId,
        );

        const songIdsById = mergeIntoMap(
          state.albums.songIdsById,
          [song.map(x => x.id)],
          () => albumId,
        );

        const songsById = mergeIntoMap(state.songs.byId, song, x => x.id);

        if (
          baseById !== state.albums.baseById ||
          detailsById !== state.albums.detailsById ||
          songIdsById !== state.albums.songIdsById ||
          songsById !== state.songs.byId
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
      },
    ),
  );
}
