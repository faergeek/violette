import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router';

import type { RouterContext } from '../_core/router';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    );
  },
});
