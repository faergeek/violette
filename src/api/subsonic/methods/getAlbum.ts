import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Album } from '../types/album';

export function subsonicGetAlbum(id: string) {
  return makeSubsonicRequest({ method: 'rest/getAlbum', id })
    .flatMap(response => parseJsonResponse(response, { album: Album }))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.album);
}
