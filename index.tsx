import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import * as Fx from './src/fx/fx';
import * as AlbumRoute from './src/routes/album';
import * as ArtistRoute from './src/routes/artist';
import * as ArtistsRoute from './src/routes/artists';
import * as LayoutRoute from './src/routes/layoutRoute';
import * as LoginRoute from './src/routes/login';
import * as RootRoute from './src/routes/root';
import { StoreProvider } from './src/store/context';
import { createAppStore } from './src/store/store';
import { subscribeToStoreStateUpdates } from './src/storeFx/subscribeToStoreStateUpdates';

const container = document.createElement('div');
container.style.width = '100%';
container.style.height = '100%';
container.style.overflow = 'scroll';
container.style.position = 'absolute';
container.style.inset = '0';
container.style.zIndex = '-9999';
container.style.visibility = 'hidden';
document.body.appendChild(container);

new ResizeObserver(entries => {
  const border = entries[0].borderBoxSize[0];
  const content = entries[0].contentBoxSize[0];

  document.documentElement.style.setProperty(
    '--scrollbar-inline-size',
    `${border.inlineSize - content.inlineSize}px`,
  );

  document.documentElement.style.setProperty(
    '--scrollbar-block-size',
    `${border.blockSize - content.blockSize}px`,
  );
}).observe(container);

const store = createAppStore();

const router = createRouter({
  context: { store },
  defaultPreload: 'intent',
  scrollRestoration: true,
  routeTree: RootRoute.route.addChildren([
    LoginRoute.route,
    LayoutRoute.route.addChildren([
      AlbumRoute.route,
      ArtistRoute.route,
      ArtistsRoute.route,
    ]),
  ]),
});

store.subscribe((state, prevState) => {
  if (state.auth.credentials !== prevState.auth.credentials) {
    router.invalidate();
  }
});

Fx.runAsync(subscribeToStoreStateUpdates(), { store }).then(result => {
  if (result.TAG !== 0) throw new Error();
});

const rootEl = document.querySelector('#app');
if (!rootEl) throw new Error();

createRoot(rootEl).render(
  <StrictMode>
    <StoreProvider store={store}>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
);
