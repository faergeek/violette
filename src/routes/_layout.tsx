import { createFileRoute, invariant } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../_core/requireSubsonicCredentials';

export const Route = createFileRoute('/_layout')({
  beforeLoad: requireSubsonicCredentials,
  async loader({ context: { store } }) {
    const { auth, player } = store.getState();
    invariant(auth.credentials);
    player.init(auth.credentials);
  },
});
