import * as v from 'valibot';

import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { BaseArtist } from '../types/baseArtist';

export function subsonicGetArtists() {
  return makeSubsonicRequest({ method: 'rest/getArtists' })
    .flatMap(response =>
      parseJsonResponse(response, {
        artists: v.object({
          ignoredArticles: v.string(),
          index: v.array(
            v.object({ artist: v.array(BaseArtist), name: v.string() }),
          ),
          lastModified: v.optional(v.number()),
        }),
      }),
    )
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.artists);
}
