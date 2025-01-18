import * as v from 'valibot';

import { Fx } from '../../../_core/fx';
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

export const subsonicGetPlayQueue = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/getPlayQueue' });

  const json = yield* parseJsonResponse(response, {
    playQueue: PlayQueue,
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.playQueue);
});
