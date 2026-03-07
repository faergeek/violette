import { ArtistCard } from '../shared/artistCard.jsx';
import { card_grid_cover_art_sizes, CardGrid } from '../shared/cardGrid.jsx';
import { Container } from '../shared/container.jsx';
import css from './artistsPage.module.css';

export function ArtistsPage({
  listIds,
}: {
  listIds: Array<string | undefined>;
}) {
  return (
    <Container className={css.root}>
      <CardGrid>
        {listIds.map((id, i) => (
          <ArtistCard
            key={i}
            coverArtSizes={card_grid_cover_art_sizes}
            loadCoverArtLazily
            id={id}
          />
        ))}
      </CardGrid>
    </Container>
  );
}
