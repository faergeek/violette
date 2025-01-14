import './index.css';

import {
  createRouter,
  invariant,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { routeTree } from './routeTree.gen';
import { createAppStore } from './store/create';
import { StoreProvider } from './store/react';

const rootEl = document.getElementById('app');
invariant(rootEl);

const store = createAppStore();

const router = createRouter({
  basepath: import.meta.env.BASE_URL,
  context: { store },
  defaultPreload: 'intent',
  routeTree,
});

store.subscribe((state, prevState) => {
  if (state.auth.credentials === prevState.auth.credentials) return;

  router.invalidate();
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(rootEl).render(
  <StrictMode>
    <StoreProvider store={store}>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
);
