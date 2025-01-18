import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export const subsonicSavePlayQueue = Fx.async(async function* f(
  id: string[],
  current: string,
  { position = 0 }: { position?: number } = {},
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/savePlayQueue',
    current,
    id,
    position,
  });

  const json = yield* parseJsonResponse(response, {});

  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});
