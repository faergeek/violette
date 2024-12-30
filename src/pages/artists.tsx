import { getRouteApi } from '@tanstack/react-router';

import { ArtistCard } from '../_core/artistCard';
import { CardGrid } from '../_core/cardGrid';

export function Artists() {
  const routeApi = getRouteApi('/_layout/');
  const { artists, credentials } = routeApi.useLoaderData();

  return (
    <CardGrid>
      {artists.index
        .flatMap(entry => entry.artist)
        .map(artist => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            credentials={credentials}
          />
        ))}
    </CardGrid>
  );
}
