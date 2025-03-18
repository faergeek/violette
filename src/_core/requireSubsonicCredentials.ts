import type { ParsedLocation } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';

import type { RouterContext } from './router';

export function requireSubsonicCredentials({
  context: { store },
  location,
}: {
  context: RouterContext;
  location: ParsedLocation;
}) {
  const state = store.getState();

  if (!state.auth.credentials) {
    throw redirect({
      replace: true,
      search: { next: location.pathname + location.searchStr },
      to: '/login',
    });
  }

  return state.auth.credentials;
}
