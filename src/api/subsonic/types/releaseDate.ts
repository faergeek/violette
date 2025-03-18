import * as v from 'valibot';

export const ReleaseDate = v.object({
  day: v.optional(v.number()),
  month: v.optional(v.number()),
  year: v.optional(v.number()),
});

export type ReleaseDate = v.InferInput<typeof ReleaseDate>;
