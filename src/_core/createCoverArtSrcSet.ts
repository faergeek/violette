import { subsonicGetCoverArtUrl } from '../api/subsonic';
import type { SubsonicCredentials } from '../api/types';

export function createCoverArtSrcSet({
  coverArt,
  credentials,
}: {
  coverArt: string;
  credentials: SubsonicCredentials;
}) {
  return Array.from(
    new Set(
      [48, 64, 100, 143, 200, 300, 400].flatMap(w =>
        [1, 1.5, 2, 2.5, 3, 3.5, 4].map(x => w * x),
      ),
    ),
  )
    .sort((a, b) => a - b)
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
