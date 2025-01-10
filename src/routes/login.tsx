import { createFileRoute, redirect } from '@tanstack/react-router';
import * as v from 'valibot';

import { Fx } from '../_core/fx';
import { subsonicPing } from '../api/subsonic';

export const Route = createFileRoute('/login')({
  validateSearch: v.object({
    next: v.optional(v.string(), '/'),
  }),
  loaderDeps(opts) {
    return {
      next: opts.search.next,
    };
  },
  async loader({ context: { store }, deps }) {
    const state = store.getState();
    if (!state.auth.credentials) return;

    await subsonicPing()
      .flatMap<never, never>(() => {
        throw redirect({ replace: true, to: deps.next });
      })
      .catch(() => Fx.Ok())
      .runAsync({ credentials: state.auth.credentials });
  },
});
