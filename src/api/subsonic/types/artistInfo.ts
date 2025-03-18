import * as v from 'valibot';

import { BaseArtist } from './baseArtist';

export const ArtistInfo = v.object({
  biography: v.optional(v.string()),
  lastFmUrl: v.optional(v.string()),
  musicBrainzId: v.optional(v.string()),
  similarArtist: v.optional(
    v.array(v.union([BaseArtist, v.object({ name: v.string() })])),
  ),
});

export type ArtistInfo = v.InferInput<typeof ArtistInfo>;
