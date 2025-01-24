import * as v from 'valibot';

import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Song } from '../types/song';

export function subsonicGetTopSongs(
  artist: string,
  { count }: { count?: number } = {},
) {
  return makeSubsonicRequest({ method: 'rest/getTopSongs', artist, count })
    .flatMap(response =>
      parseJsonResponse(response, {
        topSongs: v.object({ song: v.optional(v.array(Song)) }),
      }),
    )
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.topSongs.song);
}
