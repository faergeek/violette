import * as v from 'valibot';

export const BaseAlbum = v.object({
  artist: v.string(),
  artistId: v.string(),
  coverArt: v.string(),
  duration: v.number(),
  genre: v.optional(v.string()),
  genres: v.optional(v.array(v.object({ name: v.string() }))),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  name: v.string(),
  songCount: v.number(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
  year: v.optional(v.number()),
});

export type BaseAlbum = v.InferInput<typeof BaseAlbum>;
