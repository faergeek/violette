import type { SubsonicCredentials } from '../api/subsonic/types/credentials';
import { createCoverArtSrcSet } from './createCoverArtSrcSet';

export function preloadCoverArt({
  coverArt,
  credentials,
  sizes,
}: {
  coverArt: string;
  credentials: SubsonicCredentials;
  sizes?: string;
}) {
  const img = new Image();
  if (sizes != null) img.sizes = sizes;
  img.srcset = createCoverArtSrcSet({ coverArt, credentials });
}
