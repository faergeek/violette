import { createRoute, redirect } from '@tanstack/react-router';

import * as Fx from '../fx/fx';
import { LoginPage } from '../pages/loginPage';
import { ping } from '../subsonic';
import * as Root from './root';

export const route = createRoute({
  path: '/login',
  validateSearch: x => ({ next: typeof x.next == 'string' ? x.next : '/' }),
  pendingComponent: LoginPage,
  component: LoginPage,
  getParentRoute: () => Root.route,
  loaderDeps: ({ search }) => ({ next: search.next }),
  loader: ({ context, deps }) => {
    const state = context.store.getState();
    const credentials = state.auth.credentials;
    if (credentials == null) return;

    return Fx.runAsync(
      Fx.map(ping(), () => redirect({ replace: true, to: deps.next })),
      { credentials },
    ).then(
      result => {
        if (result.TAG !== 0) throw new Error();
        return result._0;
      },
      () => undefined,
    );
  },
});
