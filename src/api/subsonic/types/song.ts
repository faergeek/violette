import * as v from 'valibot';

const ReplayGain = v.partial(
  v.object({
    albumGain: v.number(),
    albumPeak: v.number(),
    trackGain: v.number(),
    trackPeak: v.number(),
  }),
);

export const Song = v.object({
  album: v.string(),
  albumId: v.string(),
  artist: v.string(),
  artistId: v.optional(v.string()),
  coverArt: v.string(),
  discNumber: v.optional(v.number()),
  duration: v.number(),
  genre: v.optional(v.string()),
  genres: v.optional(v.array(v.object({ name: v.string() }))),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  replayGain: v.optional(ReplayGain),
  size: v.number(),
  starred: v.optional(v.string()),
  title: v.string(),
  track: v.optional(v.number()),
  userRating: v.optional(v.number()),
  year: v.optional(v.number()),
});

export type Song = v.InferInput<typeof Song>;
