import { createRoute } from '@tanstack/react-router';

import { Layout } from '../shared/layout';
import { requireSubsonicCredentials } from '../shared/routerUtils.js';
import * as Root from './root';

export const route = createRoute({
  beforeLoad: requireSubsonicCredentials,
  component: Layout,
  getParentRoute: () => Root.route,
  id: '/_layout',
  pendingComponent: Layout,
});
