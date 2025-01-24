import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Song } from '../types/song';

export function subsonicGetSong(id: string) {
  return makeSubsonicRequest({ method: 'rest/getSong', id })
    .flatMap(response => parseJsonResponse(response, { song: Song }))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.song);
}
