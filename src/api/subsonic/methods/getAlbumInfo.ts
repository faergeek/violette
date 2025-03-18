import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { AlbumInfo } from '../types/albumInfo';

export function subsonicGetAlbumInfo(id: string) {
  return makeSubsonicRequest({ method: 'rest/getAlbumInfo2', id })
    .flatMap(response => parseJsonResponse(response, { albumInfo: AlbumInfo }))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.albumInfo);
}
