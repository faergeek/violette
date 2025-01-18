import * as v from 'valibot';

import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { BaseAlbum } from '../types/baseAlbum';
import { BaseArtist } from '../types/baseArtist';

export const subsonicGetArtist = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({ method: 'rest/getArtist', id });

  const json = yield* parseJsonResponse(response, {
    artist: v.object({
      ...BaseArtist.entries,
      album: v.array(BaseAlbum),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.artist);
});
