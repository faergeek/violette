import * as v from 'valibot';

import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { BaseArtist } from '../types/baseArtist';

export const subsonicGetArtists = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/getArtists' });

  const json = yield* parseJsonResponse(response, {
    artists: v.object({
      ignoredArticles: v.string(),
      index: v.array(
        v.object({
          artist: v.array(BaseArtist),
          name: v.string(),
        }),
      ),
      lastModified: v.optional(v.number()),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.artists);
});
