import { subsonicGetCoverArtUrl } from '../api/subsonic/methods/getCoverArtUrl';
import type { SubsonicCredentials } from '../api/subsonic/types/credentials';

export function createCoverArtSrcSet({
  coverArt,
  credentials,
}: {
  coverArt: string;
  credentials: SubsonicCredentials;
}) {
  return [50, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500, 2000]
    .map(w =>
      [
        subsonicGetCoverArtUrl(credentials, coverArt, { size: w }),
        w != null ? `${w}w` : undefined,
      ]
        .filter(Boolean)
        .join(' '),
    )
    .join(',');
}
