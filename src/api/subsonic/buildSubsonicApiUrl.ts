import { MIN_SERVER_VERSION } from './constants';
import type { SubsonicCredentials } from './types/credentials';

export interface SubsonicRequest {
  method: string;
  [key: string]: unknown;
}

export function buildSubsonicApiUrl(
  { salt, serverBaseUrl, token, username }: SubsonicCredentials,
  request: SubsonicRequest,
) {
  const url = new URL(request.method, serverBaseUrl);
  url.searchParams.set('c', 'Violette');
  url.searchParams.set('f', 'json');
  url.searchParams.set('s', salt);
  url.searchParams.set('t', token);
  url.searchParams.set('u', username);
  url.searchParams.set('v', MIN_SERVER_VERSION);

  Object.entries(request)
    .filter(([key, value]) => key !== 'method' && value !== undefined)
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        for (const valueItem of value) {
          url.searchParams.append(key, String(valueItem));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    });

  return new URL(url);
}
