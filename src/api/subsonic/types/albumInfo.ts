import * as v from 'valibot';

export const AlbumInfo = v.object({
  lastFmUrl: v.optional(v.string()),
  musicBrainzId: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export type AlbumInfo = v.InferInput<typeof AlbumInfo>;
