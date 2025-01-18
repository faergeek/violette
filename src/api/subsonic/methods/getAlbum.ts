import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Album } from '../types/album';

export const subsonicGetAlbum = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({ method: 'rest/getAlbum', id });

  const json = yield* parseJsonResponse(response, { album: Album });
  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.album);
});
