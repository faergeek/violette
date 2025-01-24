import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import type { StarParams } from '../types/starParams';

export function subsonicUnstar({ albumId, artistId, id }: StarParams) {
  return makeSubsonicRequest({ method: 'rest/unstar', albumId, artistId, id })
    .flatMap(response => parseJsonResponse(response, {}))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(() => {});
}
