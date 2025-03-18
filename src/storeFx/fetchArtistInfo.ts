import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetArtistInfo } from '../api/subsonic/methods/getArtistInfo';
import type { SimilarArtist } from '../slices/artists';
import type { AppStore } from '../store/create';

export const fetchArtistInfo = Fx.async(async function* f(artistId: string) {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;

  const { similarArtist, ...artistInfo } = yield* subsonicGetArtistInfo(
    artistId,
    { includeNotPresent: true },
  ).provide({ credentials });

  const artistInfoById = mergeIntoMap(
    store.getState().artists.artistInfoById,
    [artistInfo],
    () => artistId,
  );

  const byId = similarArtist
    ? mergeIntoMap(
        store.getState().artists.byId,
        similarArtist
          .filter(x => 'id' in x)
          .map(artist => {
            const original = store.getState().artists.byId.get(artist.id);

            return original ? { ...artist, ...original } : artist;
          }),
        x => x.id,
      )
    : store.getState().artists.byId;

  const similarArtistsById = mergeIntoMap(
    store.getState().artists.similarArtistsById,
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
    artistInfoById !== store.getState().artists.artistInfoById ||
    byId !== store.getState().artists.byId ||
    similarArtistsById !== store.getState().artists.similarArtistsById
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
});
