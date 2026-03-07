import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { star } from '../subsonic';
import * as StoreFx__FetchOneAlbum from './fetchOneAlbum';
import * as StoreFx__FetchOneArtist from './fetchOneArtist';
import * as StoreFx__FetchOneSong from './fetchOneSong';

export function make(params: {
  albumId?: string;
  artistId?: string;
  id?: string;
}) {
  return Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) =>
    Fx.bind(
      Fx.provide(star(params), {
        credentials: store.getState().auth.credentials,
      }),
      () => {
        const { albumId, artistId, id } = params;

        if (albumId != null) return StoreFx__FetchOneAlbum.make(albumId);
        if (artistId != null) return StoreFx__FetchOneArtist.make(artistId);
        if (id != null) return StoreFx__FetchOneSong.make(id);

        return Fx.Ok();
      },
    ),
  );
}
