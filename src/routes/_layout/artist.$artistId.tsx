import { createFileRoute, invariant } from '@tanstack/react-router';

import { MEDIA_HEADER_COVER_ART_SIZES } from '../../_core/mediaHeader';
import { preloadCoverArt } from '../../_core/preloadCoverArt';
import { requireSubsonicCredentials } from '../../_core/requireSubsonicCredentials';
import { fetchArtistInfo } from '../../storeFx/fetchArtistInfo';
import { fetchOneArtist } from '../../storeFx/fetchOneArtist';
import { fetchTopSongs } from '../../storeFx/fetchTopSongs';

export enum ArtistTab {
  Albums = 'albums',
  SimilarArtists = 'similar-artists',
  TopSongs = 'top-songs',
}

export const Route = createFileRoute('/_layout/artist/$artistId')({
  beforeLoad: requireSubsonicCredentials,
  async loader({ context: { store }, params: { artistId } }) {
    const fetchOnePromise = fetchOneArtist(artistId)
      .runAsync({ store })
      .then(result => result.assertOk())
      .then(() => {
        const state = store.getState();
        const initialArtist = state.artists.byId.get(artistId);
        invariant(initialArtist);

        return initialArtist;
      });

    const artistInfoPromise = fetchArtistInfo(artistId)
      .runAsync({ store })
      .then(result => result.assertOk());

    const deferredArtistInfo = artistInfoPromise.then(() => {
      const state = store.getState();
      const artistInfo = state.artists.artistInfoById.get(artistId);
      invariant(artistInfo);

      return artistInfo;
    });

    const deferredSimilarArtists = artistInfoPromise.then(() => {
      const state = store.getState();
      const similarArtists = state.artists.similarArtistsById.get(artistId);
      invariant(similarArtists);

      return similarArtists;
    });

    const initialArtist =
      store.getState().artists.byId.get(artistId) ?? (await fetchOnePromise);

    const { credentials } = store.getState().auth;
    invariant(credentials);
    preloadCoverArt({
      coverArt: initialArtist.coverArt,
      credentials,
      sizes: MEDIA_HEADER_COVER_ART_SIZES,
    });

    await fetchOnePromise;
    const { artists } = store.getState();

    const initialAlbumIds = artists.albumIdsByArtistId.get(artistId);
    invariant(initialAlbumIds);

    const deferredTopSongIds = fetchTopSongs(initialArtist.name)
      .runAsync({ store })
      .then(result => result.assertOk())
      .then(() => {
        const state = store.getState();
        const topSongIds = state.artists.topSongIdsByArtistName.get(
          initialArtist.name,
        );
        invariant(topSongIds);

        return topSongIds;
      });

    return {
      deferredArtistInfo,
      deferredSimilarArtists,
      deferredTopSongIds,
      initialAlbumIds,
      initialArtist,
    };
  },
});
