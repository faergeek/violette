import * as v from 'valibot';

import { Fx } from '../_core/fx';
import type {
  SubsonicCredentials,
  SubsonicError,
  SubsonicRequest,
} from './types';
import {
  BaseAlbum,
  BaseArtist,
  BaseSong,
  Song,
  SubsonicResponseJsonFailed,
  SubsonicResponseJsonOk,
} from './types';

const MIN_SERVER_VERSION = '1.8.0';

function buildSubsonicApiUrl(
  { salt, serverBaseUrl, token, username }: SubsonicCredentials,
  request: SubsonicRequest,
) {
  const url = new URL(request.method, serverBaseUrl);
  url.searchParams.set('c', 'Player');
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

const makeSubsonicRequest = Fx.async(async function* f(
  subsonicRequest: SubsonicRequest,
) {
  const { credentials } = yield* Fx.ask<{ credentials: SubsonicCredentials }>();
  const request = buildSubsonicApiUrl(credentials, subsonicRequest);

  try {
    const response = await fetch(request);

    return response.ok
      ? Fx.Ok(response)
      : Fx.Err<SubsonicError>({
          type: 'request-failed',
          status: response.status,
          statusText: response.statusText,
        });
  } catch (error) {
    return Fx.Err<SubsonicError>({ type: 'network-error', error });
  }
});

const parseJsonResponse = Fx.async(async function* f<T extends v.ObjectEntries>(
  response: Response,
  entries: T,
) {
  const contentTypeHeader = response.headers.get('content-type');

  const actualContentType =
    contentTypeHeader && contentTypeHeader?.indexOf(';') !== -1
      ? contentTypeHeader.slice(0, contentTypeHeader.indexOf(';'))
      : contentTypeHeader;

  if (actualContentType !== 'application/json') {
    yield* Fx.Err<SubsonicError>({
      type: 'non-json-content-type',
      actual: actualContentType,
    });
  }

  const json = await response.json();

  const result = v.safeParse(
    v.object({
      'subsonic-response': v.union([
        v.object({
          ...SubsonicResponseJsonOk.entries,
          ...entries,
        }),
        SubsonicResponseJsonFailed,
      ]),
    }),
    json,
  );

  return result.success === true
    ? Fx.Ok(result.output)
    : Fx.Err({ type: 'validation-failed', issues: result.issues });
});

function handleJsonResponse<T extends SubsonicResponseJsonOk>(
  response: T | SubsonicResponseJsonFailed,
): Fx<T, SubsonicError, unknown> {
  return response.status === 'failed'
    ? Fx.Err({
        type: 'api-error',
        code: response.error.code,
        message: response.error.message,
      })
    : Fx.Ok(response);
}

export const subsonicPing = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/ping' });
  const json = yield* parseJsonResponse(response, {});

  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});

export const subsonicGetLicense = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/getLicense' });

  const json = yield* parseJsonResponse(response, {
    license: v.object({ valid: v.boolean() }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.license);
});

export const subsonicGetArtists = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/getArtists' });

  const json = yield* parseJsonResponse(response, {
    artists: v.object({
      ignoredArticles: v.string(),
      index: v.array(
        v.object({
          artist: v.array(BaseArtist),
          name: v.string(),
        }),
      ),
      lastModified: v.optional(v.number()),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.artists);
});

export const subsonicGetArtist = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({ method: 'rest/getArtist', id });

  const json = yield* parseJsonResponse(response, {
    artist: v.object({
      ...BaseArtist.entries,
      album: v.array(
        v.object({
          ...BaseAlbum.entries,
          duration: v.number(),
          musicBrainzId: v.optional(v.string()),
          songCount: v.number(),
        }),
      ),
      albumCount: v.number(),
      musicBrainzId: v.optional(v.string()),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.artist);
});

export const subsonicGetArtistInfo = Fx.async(async function* f(
  id: string,
  {
    count,
    includeNotPresent,
  }: {
    count?: number;
    includeNotPresent?: boolean;
  },
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/getArtistInfo2',
    id,
    count,
    includeNotPresent,
  });

  const json = yield* parseJsonResponse(response, {
    artistInfo2: v.object({
      biography: v.optional(v.string()),
      lastFmUrl: v.optional(v.string()),
      musicBrainzId: v.optional(v.string()),
      similarArtist: v.optional(
        v.array(
          v.object({
            coverArt: v.pipe(
              v.optional(v.string()),
              v.transform(s => (s === 'ar--1_0' ? undefined : s)),
            ),
            id: v.pipe(
              v.optional(v.string()),
              v.transform(s => (s === '-1' ? undefined : s)),
            ),
            name: v.string(),
          }),
        ),
      ),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.artistInfo2);
});

export const subsonicGetAlbum = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({ method: 'rest/getAlbum', id });

  const json = yield* parseJsonResponse(response, {
    album: v.object({
      ...BaseAlbum.entries,
      artist: v.string(),
      artistId: v.string(),
      created: v.string(),
      discTitles: v.optional(
        v.array(
          v.object({
            disc: v.number(),
            title: v.string(),
          }),
        ),
      ),
      duration: v.number(),
      genre: v.optional(v.string()),
      genres: v.optional(
        v.array(
          v.object({
            name: v.string(),
          }),
        ),
      ),
      isCompilation: v.optional(v.boolean()),
      musicBrainzId: v.optional(v.string()),
      originalReleaseDate: v.optional(
        v.object({
          day: v.optional(v.number()),
          month: v.optional(v.number()),
          year: v.optional(v.number()),
        }),
      ),
      releaseDate: v.optional(
        v.object({
          day: v.optional(v.number()),
          month: v.optional(v.number()),
          year: v.optional(v.number()),
        }),
      ),
      song: v.array(Song),
      songCount: v.number(),
      userRating: v.optional(v.number()),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.album);
});

export const subsonicGetAlbumInfo = Fx.async(async function* f(id: string) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/getAlbumInfo2',
    id,
  });

  const json = yield* parseJsonResponse(response, {
    albumInfo: v.object({
      lastFmUrl: v.optional(v.string()),
      musicBrainzId: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.albumInfo);
});

export const subsonicGetTopSongs = Fx.async(async function* f(
  artist: string,
  { count }: { count?: number } = {},
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/getTopSongs',
    artist,
    count,
  });

  const json = yield* parseJsonResponse(response, {
    topSongs: v.object({
      song: v.optional(v.array(Song)),
    }),
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.topSongs.song);
});

const PlayQueue = v.object({
  changed: v.string(),
  changedBy: v.string(),
  current: v.optional(v.string()),
  entry: v.array(BaseSong),
  position: v.optional(v.number()),
  username: v.string(),
});

export const subsonicGetPlayQueue = Fx.async(async function* f() {
  const response = yield* makeSubsonicRequest({ method: 'rest/getPlayQueue' });

  const json = yield* parseJsonResponse(response, {
    playQueue: PlayQueue,
  });

  const result = yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok(result.playQueue);
});

export const subsonicSavePlayQueue = Fx.async(async function* f(
  id: string[],
  current: string,
  { position = 0 }: { position?: number } = {},
) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/savePlayQueue',
    current,
    id,
    position,
  });

  const json = yield* parseJsonResponse(response, {});

  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});

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

export const subsonicStar = Fx.async(async function* f({
  albumId,
  artistId,
  id,
}: {
  albumId?: string;
  artistId?: string;
  id?: string;
} = {}) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/star',
    albumId,
    artistId,
    id,
  });

  const json = yield* parseJsonResponse(response, {});
  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});

export const subsonicUnstar = Fx.async(async function* f({
  albumId,
  artistId,
  id,
}: {
  albumId?: string;
  artistId?: string;
  id?: string;
} = {}) {
  const response = yield* makeSubsonicRequest({
    method: 'rest/unstar',
    albumId,
    artistId,
    id,
  });

  const json = yield* parseJsonResponse(response, {});
  yield* handleJsonResponse(json['subsonic-response']);

  return Fx.Ok();
});
