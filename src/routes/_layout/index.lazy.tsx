import { createLazyFileRoute } from '@tanstack/react-router';

import { Artists } from '../../pages/artists';

export const Route = createLazyFileRoute('/_layout/')({
  component: Artists,
});
