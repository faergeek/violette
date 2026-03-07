import type { ParsedLocation } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';

import type { Store } from '../store/types';

export function requireSubsonicCredentials({
  context,
  location,
}: {
  context: { store: Store };
  location: ParsedLocation;
}) {
  const state = context.store.getState();

  return state.auth.credentials
    ? undefined
    : redirect({
        replace: true,
        search: { next: location.pathname + location.searchStr },
        to: '/login',
      });
}
