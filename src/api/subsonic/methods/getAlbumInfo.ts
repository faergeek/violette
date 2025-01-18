import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { AlbumInfo } from '../types/albumInfo';

export const subsonicGetAlbumInfo = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/getAlbumInfo2',
    id,
  });

  const json = yield* parseJsonResponse(response, { albumInfo: AlbumInfo });
  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.albumInfo);
});
