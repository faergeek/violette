import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export function subsonicStar({
  albumId,
  artistId,
  id,
}: {
  albumId?: string;
  artistId?: string;
  id?: string;
}) {
  return makeSubsonicRequest({
    method: 'rest/star',
    albumId,
    artistId,
    id,
  })
    .flatMap(response => parseJsonResponse(response, {}))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(() => {});
}
