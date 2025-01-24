import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export function subsonicScrobble(
  id: string,
  { submission, time }: { submission?: boolean; time?: number } = {},
) {
  return makeSubsonicRequest({ method: 'rest/scrobble', id, submission, time })
    .flatMap(response => parseJsonResponse(response, {}))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(() => {});
}
