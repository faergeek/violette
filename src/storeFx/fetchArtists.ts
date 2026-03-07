import { deepEqual } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import type { BaseArtist } from '../subsonic';
import { getArtists } from '../subsonic';

export function fetchArtists() {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(getArtists(), {
        credentials: store.getState().auth.credentials,
      }),
      ({ index }) => {
        const artists: BaseArtist[] = [];
        for (const { artist } of index) artists.push(...artist);

        const state = store.getState();
        const byId = mergeIntoMap(state.artists.byId, artists, x => x.id);
        const listIds = artists.map(artist => artist.id);

        if (
          byId !== state.artists.byId ||
          !deepEqual(listIds, state.artists.listIds)
        ) {
          store.setState(prevState => ({
            artists: { ...prevState.artists, byId, listIds },
          }));
        }

        return Fx.Ok();
      },
    ),
  );
}
