import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import type { StarParams } from '../types/starParams';

export const subsonicUnstar = Fx.async(async function* f({
  albumId,
  artistId,
  id,
}: StarParams) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/unstar',
    albumId,
    artistId,
    id,
  });

  const json = yield* parseJsonResponse(response, {});
  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});
