import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export const subsonicPing = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/ping' });
  const json = yield* parseJsonResponse(response, {});

  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});
