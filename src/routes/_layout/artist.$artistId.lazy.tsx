import { createLazyFileRoute } from '@tanstack/react-router';

import { Artist } from '../../pages/artist';

export const Route = createLazyFileRoute('/_layout/artist/$artistId')({
  component: Artist,
});
