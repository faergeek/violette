import { createLazyFileRoute } from '@tanstack/react-router';

import { ArtistCard } from '../../_core/artistCard';
import { CARD_GRID_COVER_ART_SIZES, CardGrid } from '../../_core/cardGrid';
import { useAppStore } from '../../store/react';

export const Route = createLazyFileRoute('/_layout/')({
  pendingComponent: function HomePending() {
    return (
      <div className="container mx-auto">
        <CardGrid>
          {new Array<null>(30).fill(null).map((_, i) => (
            <ArtistCard key={i} />
          ))}
        </CardGrid>
      </div>
    );
  },
  component: function HomeRoute() {
    const { initialListIds } = Route.useLoaderData();

    const listIds = useAppStore(
      state => state.artists.listIds ?? initialListIds,
    );

    return (
      <div className="container mx-auto">
        <CardGrid>
          {listIds.map(id => (
            <ArtistCard
              key={id}
              coverArtSizes={CARD_GRID_COVER_ART_SIZES}
              id={id}
              loadCoverArtLazily
            />
          ))}
        </CardGrid>
      </div>
    );
  },
});
