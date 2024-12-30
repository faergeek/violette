import { createLazyFileRoute } from '@tanstack/react-router';

import { Album } from '../../pages/album';

export const Route = createLazyFileRoute('/_layout/album/$albumId')({
  component: Album,
});
