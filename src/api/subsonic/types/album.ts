import * as v from 'valibot';

import { BaseAlbum } from './baseAlbum';
import { DiscTitle } from './discTitle';
import { ReleaseDate } from './releaseDate';
import { Song } from './song';

export const Album = v.object({
  ...BaseAlbum.entries,
  discTitles: v.optional(v.array(DiscTitle)),
  isCompilation: v.optional(v.boolean()),
  originalReleaseDate: v.optional(ReleaseDate),
  releaseDate: v.optional(ReleaseDate),
  song: v.array(Song),
});
