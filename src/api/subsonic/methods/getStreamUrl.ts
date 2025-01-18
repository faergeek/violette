import { buildSubsonicApiUrl } from '../buildSubsonicApiUrl';
import type { SubsonicCredentials } from '../types/credentials';

export function subsonicGetStreamUrl(
  credentials: SubsonicCredentials,
  id: string,
  {
    converted,
    estimateContentLength,
    format,
    maxBitRate,
  }: {
    converted?: boolean;
    estimateContentLength?: boolean;
    format?: 'flac' | 'mp3' | 'raw';
    maxBitRate?: number;
  } = {},
) {
  return buildSubsonicApiUrl(credentials, {
    method: 'rest/stream',
    converted,
    estimateContentLength,
    format,
    id,
    maxBitRate,
  }).toString();
}
