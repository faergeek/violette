import { deepEqual } from '@tanstack/react-router';

import { Fx } from '../_core/fx';
import { mergeIntoMap } from '../_core/mergeIntoMap';
import { subsonicGetArtists } from '../api/subsonic/methods/getArtists';
import type { AppStore } from '../store/create';

export const fetchArtists = Fx.async(async function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();
  const { credentials } = store.getState().auth;

  const { index } = yield* subsonicGetArtists().provide({ credentials });
  const artists = index.flatMap(entry => entry.artist);

  const byId = mergeIntoMap(store.getState().artists.byId, artists, x => x.id);
  const listIds = artists.map(artist => artist.id);

  if (
    byId !== store.getState().artists.byId ||
    !deepEqual(listIds, store.getState().artists.listIds)
  ) {
    store.setState(prevState => ({
      artists: { ...prevState.artists, byId, listIds },
    }));
  }

  return Fx.Ok();
});
