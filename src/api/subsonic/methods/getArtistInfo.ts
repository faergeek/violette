import {
  handleJsonResponse,
  makeSubsonicRequest,
  parseJsonResponse,
} from '../makeRequest';
import { ArtistInfo } from '../types/artistInfo';

export function subsonicGetArtistInfo(
  id: string,
  {
    count,
    includeNotPresent,
  }: {
    count?: number;
    includeNotPresent?: boolean;
  } = {},
) {
  return makeSubsonicRequest({
    method: 'rest/getArtistInfo2',
    count,
    id,
    includeNotPresent,
  })
    .flatMap(response =>
      parseJsonResponse(response, { artistInfo2: ArtistInfo }),
    )
    .flatMap(json => handleJsonResponse(json['subsonic-response']))
    .map(result => result.artistInfo2);
}
