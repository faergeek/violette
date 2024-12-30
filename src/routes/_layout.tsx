import { createFileRoute } from '@tanstack/react-router';

import { requireSubsonicCredentials } from '../_core/requireSubsonicCredentials';
import { refreshPlayQueue } from '../store/mutations';

export const Route = createFileRoute('/_layout')({
  async loader({ context, location }) {
    const credentials = requireSubsonicCredentials(context, location);

    await refreshPlayQueue()(context.store);

    return { credentials };
  },
});
