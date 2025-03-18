import { createFileRoute, redirect } from '@tanstack/react-router';
import * as v from 'valibot';

import { Fx } from '../_core/fx';
import { subsonicPing } from '../api/subsonic/methods/ping';

export const Route = createFileRoute('/login')({
  validateSearch: v.object({
    next: v.optional(v.string(), '/'),
  }),
  loaderDeps(opts) {
    return {
      next: opts.search.next,
    };
  },
  loader({ context: { store }, deps }) {
    const state = store.getState();
    if (!state.auth.credentials) return;

    return subsonicPing()
      .map(() => redirect({ replace: true, to: deps.next }))
      .catch(() => Fx.Ok())
      .runAsync({ credentials: state.auth.credentials })
      .then(result => result.assertOk());
  },
});
