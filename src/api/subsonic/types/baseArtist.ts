import * as v from 'valibot';

export const BaseArtist = v.object({
  albumCount: v.number(),
  coverArt: v.string(),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  name: v.string(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
});

export type BaseArtist = v.InferInput<typeof BaseArtist>;
