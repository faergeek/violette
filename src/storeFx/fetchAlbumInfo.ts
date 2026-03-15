import * as Fx from '../fx/fx';
import { mergeIntoMap } from '../mergeIntoMap/mergeIntoMap';
import type { Store } from '../store/types';
import { getAlbumInfo2 } from '../subsonic';

export function fetchAlbumInfo(albumId: string) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(getAlbumInfo2(albumId), {
        credentials: store.getState().auth.credentials,
      }),
      albumInfo => {
        const state = store.getState();

        const infoById = mergeIntoMap(
          state.albums.infoById,
          [albumInfo],
          () => albumId,
        );

        if (infoById !== state.albums.infoById) {
          store.setState(prevState => ({
            albums: { ...prevState.albums, infoById },
          }));
        }

        return Fx.Ok();
      },
    ),
  );
}
