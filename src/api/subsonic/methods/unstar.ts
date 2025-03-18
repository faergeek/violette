import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';

export function subsonicUnstar({
  albumId,
  artistId,
  id,
}: {
  albumId?: string;
  artistId?: string;
  id?: string;
}) {
  return makeSubsonicRequest({ method: 'rest/unstar', albumId, artistId, id })
    .flatMap(response => parseJsonResponse(response, {}))
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(() => {});
}
