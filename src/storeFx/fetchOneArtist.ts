import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import { getArtist } from '../subsonic';

export function make(artistId: string) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(getArtist(artistId), {
        credentials: store.getState().auth.credentials,
      }),
      ({
        album = [],
        albumCount,
        coverArt,
        musicBrainzId,
        name,
        starred,
        userRating,
        id,
      }) => {
        const state = store.getState();

        const albumBaseById = mergeIntoMap(
          state.albums.baseById,
          album,
          x => x.id,
        );

        const albumIdsByArtistId = mergeIntoMap(
          state.artists.albumIdsByArtistId,
          [album.map(x => x.id)],
          () => id,
        );

        const byId = mergeIntoMap(
          state.artists.byId,
          [
            {
              albumCount,
              coverArt,
              id,
              musicBrainzId,
              name,
              starred,
              userRating,
            },
          ],
          x => x.id,
        );

        if (
          albumBaseById !== state.albums.baseById ||
          albumIdsByArtistId !== state.artists.albumIdsByArtistId ||
          byId !== state.artists.byId
        ) {
          store.setState(prevState => ({
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
        }

        return Fx.Ok();
      },
    ),
  );
}
