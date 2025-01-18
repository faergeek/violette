import * as v from 'valibot';

import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Song } from '../types/song';

export const subsonicGetTopSongs = Fx.async(async function* f(
  artist: string,
  { count }: { count?: number } = {},
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/getTopSongs',
    artist,
    count,
  });

  const json = yield* parseJsonResponse(response, {
    topSongs: v.object({
      song: v.optional(v.array(Song)),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.topSongs.song);
});
