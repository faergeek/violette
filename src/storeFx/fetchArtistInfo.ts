import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import { getArtistInfo2 } from '../subsonic';

export function fetchArtistInfo(artistId: string) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(getArtistInfo2(artistId, undefined, true), {
        credentials: store.getState().auth.credentials,
      }),
      ({ biography, lastFmUrl, musicBrainzId, similarArtist }) => {
        const state = store.getState();

        const artistInfoById = mergeIntoMap(
          state.artists.artistInfoById,
          [{ biography, lastFmUrl, musicBrainzId }],
          () => artistId,
        );

        const byId = similarArtist
          ? mergeIntoMap(
              state.artists.byId,
              similarArtist
                .map(artistVariant => {
                  if (artistVariant.TAG !== /* Artist */ 0) return undefined;

                  const artist = artistVariant._0;
                  const original = state.artists.byId.get(artist.id);

                  return original == null
                    ? artist
                    : {
                        albumCount: artist.albumCount,
                        coverArt: artist.coverArt,
                        id: original.id,
                        musicBrainzId: artist.musicBrainzId,
                        name: artist.name,
                        starred: artist.starred,
                        userRating: artist.userRating,
                      };
                })
                .filter(x => x != null),
              x => x.id,
            )
          : state.artists.byId;

        const similarArtistsById = mergeIntoMap(
          state.artists.similarArtistsById,
          [similarArtist ?? []],
          () => artistId,
        );

        if (
          artistInfoById !== state.artists.artistInfoById ||
          byId !== state.artists.byId ||
          similarArtistsById !== state.artists.similarArtistsById
        ) {
          store.setState(prevState => ({
            artists: {
              ...prevState.artists,
              artistInfoById,
              byId,
              similarArtistsById,
            },
          }));
        }

        return Fx.Ok();
      },
    ),
  );
}
