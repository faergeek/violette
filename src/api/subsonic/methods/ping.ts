import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export function subsonicPing() {
  return makeSubsonicRequest({ method: 'rest/ping' })
    .flatMap(response => parseJsonResponse(response, {}))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(() => {});
}
