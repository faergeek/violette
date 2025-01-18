import { Fx } from '../../../_core/fx';
import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Song } from '../types/song';

export const subsonicGetSong = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({ method: 'rest/getSong', id });

  const json = yield* parseJsonResponse(response, { song: Song });
  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.song);
});
