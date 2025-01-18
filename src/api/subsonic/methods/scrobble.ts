import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export const subsonicScrobble = Fx.async(async function* f(
  id: string,
  { submission, time }: { submission?: boolean; time?: number } = {},
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/scrobble',
    id,
    submission,
    time,
  });

  const json = yield* parseJsonResponse(response, {});
  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});
