import { buildSubsonicApiUrl } from '../buildSubsonicApiUrl';
import type { SubsonicCredentials } from '../types/credentials';

export function subsonicGetCoverArtUrl(
  credentials: SubsonicCredentials,
  id: string,
  { size }: { size?: number } = {},
) {
  return buildSubsonicApiUrl(credentials, {
    method: 'rest/getCoverArt',
    id,
    size,
  }).toString();
}
