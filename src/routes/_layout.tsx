import { createFileRoute } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../_core/requireSubsonicCredentials';
import { initializePlayQueue } from '../storeFx/initializePlayQueue';

export const Route = createFileRoute('/_layout')({
  beforeLoad: requireSubsonicCredentials,
  loader({ context: { store } }) {
    initializePlayQueue()
      .runAsync({ store })
      .then(result => result.assertOk());
  },
});
