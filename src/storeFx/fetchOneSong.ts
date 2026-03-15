import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import { getSong } from '../subsonic';

export function make(id: string) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(getSong(id), {
        credentials: store.getState().auth.credentials,
      }),
      song => {
        const state = store.getState();
        const byId = mergeIntoMap(state.songs.byId, [song], x => x.id);

        if (byId !== state.songs.byId) {
          store.setState(() => ({ songs: { byId } }));
        }

        return Fx.Ok();
      },
    ),
  );
}
