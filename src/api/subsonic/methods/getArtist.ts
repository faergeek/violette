import * as v from 'valibot';

import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { BaseAlbum } from '../types/baseAlbum';
import { BaseArtist } from '../types/baseArtist';

export function subsonicGetArtist(id: string) {
  return makeSubsonicRequest({ method: 'rest/getArtist', id })
    .flatMap(response =>
      parseJsonResponse(response, {
        artist: v.object({ ...BaseArtist.entries, album: v.array(BaseAlbum) }),
      }),
    )
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.artist);
}
