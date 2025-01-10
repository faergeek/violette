import { createLazyFileRoute } from '@tanstack/react-router';

import { ArtistPage } from '../../pages/artist';

export const Route = createLazyFileRoute('/_layout/artist/$artistId')({
  pendingComponent: function ArtistPending() {
    return <ArtistPage params={Route.useParams()} search={Route.useSearch()} />;
  },
  component: function ArtistRoute() {
    const params = Route.useParams();
    const search = Route.useSearch();

    const {
      deferredArtistInfo,
      deferredSimilarArtists,
      deferredTopSongIds,
      initialAlbumIds,
      initialArtist,
    } = Route.useLoaderData();

    return (
      <ArtistPage
        deferredArtistInfo={deferredArtistInfo}
        deferredSimilarArtists={deferredSimilarArtists}
        deferredTopSongIds={deferredTopSongIds}
        initialAlbumIds={initialAlbumIds}
        initialArtist={initialArtist}
        params={params}
        search={search}
      />
    );
  },
});
