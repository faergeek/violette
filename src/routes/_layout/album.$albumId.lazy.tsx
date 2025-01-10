import { createLazyFileRoute } from '@tanstack/react-router';

import { AlbumPage } from '../../pages/album';

export const Route = createLazyFileRoute('/_layout/album/$albumId')({
  pendingComponent: function AlbumPending() {
    const { albumId } = Route.useParams();

    return <AlbumPage albumId={albumId} search={Route.useSearch()} />;
  },
  component: function AlbumRoute() {
    const params = Route.useParams();
    const search = Route.useSearch();
    const { deferredAlbumInfo } = Route.useLoaderData();

    return (
      <AlbumPage
        albumId={params.albumId}
        deferredAlbumInfo={deferredAlbumInfo}
        search={search}
      />
    );
  },
});
