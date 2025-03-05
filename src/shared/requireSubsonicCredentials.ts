import type { ParsedLocation } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';
import type { StoreApi } from 'zustand';

import type { StoreState } from '../store/create';

export function requireSubsonicCredentials({
  context: { store },
  location,
}: {
  context: {
    store: StoreApi<StoreState>;
  };
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
