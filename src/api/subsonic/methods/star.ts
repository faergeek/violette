import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import type { StarParams } from '../types/starParams';

export function subsonicStar({ albumId, artistId, id }: StarParams) {
  return makeSubsonicRequest({
    method: 'rest/star',
    albumId,
    artistId,
    id,
  })
    .flatMap(response => parseJsonResponse(response, {}))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(() => {});
}
