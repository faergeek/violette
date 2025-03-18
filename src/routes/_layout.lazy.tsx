import { createLazyFileRoute } from '@tanstack/react-router';

import { Layout } from '../layout/layout';

export const Route = createLazyFileRoute('/_layout')({
  component: Layout,
  pendingComponent: Layout,
});
