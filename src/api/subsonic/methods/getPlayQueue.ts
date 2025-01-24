import * as v from 'valibot';

import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { Song } from '../types/song';

const PlayQueue = v.object({
  changed: v.string(),
  changedBy: v.string(),
  current: v.optional(v.string()),
  entry: v.array(Song),
  position: v.optional(v.number()),
  username: v.string(),
});

export function subsonicGetPlayQueue() {
  return makeSubsonicRequest({ method: 'rest/getPlayQueue' })
    .flatMap(response =>
      parseJsonResponse(response, { playQueue: v.optional(PlayQueue) }),
    )
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.playQueue);
}
