import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { ArtistInfo } from '../types/artistInfo';

export const subsonicGetArtistInfo = Fx.async(async function* f(
  id: string,
  {
    count,
    includeNotPresent,
  }: {
    count?: number;
    includeNotPresent?: boolean;
  } = {},
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/getArtistInfo2',
    id,
    count,
    includeNotPresent,
  });

  const json = yield* parseJsonResponse(response, {
    artistInfo2: ArtistInfo,
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.artistInfo2);
});
