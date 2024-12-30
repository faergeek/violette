import type { ParsedLocation } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';

import type { RouterContext } from './router';

export function requireSubsonicCredentials(
  { store }: RouterContext,
  location: ParsedLocation,
) {
  const state = store.getState();

  if (!state.credentials) {
    throw redirect({
      replace: true,
      search: { next: location.pathname + location.searchStr },
      to: '/login',
    });
  }

  return state.credentials;
}
