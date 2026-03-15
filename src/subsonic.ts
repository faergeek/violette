import * as v from 'valibot';

import * as Fx from './fx/fx';

const Genre = v.object({ name: v.string() });

const ReplayGain = v.object({
  albumGain: v.optional(v.number()),
  albumPeak: v.optional(v.number()),
  trackGain: v.optional(v.number()),
  trackPeak: v.optional(v.number()),
});

const Song = v.object({
  album: v.string(),
  albumId: v.string(),
  artist: v.string(),
  artistId: v.string(),
  coverArt: v.string(),
  discNumber: v.optional(v.number()),
  duration: v.number(),
  genre: v.optional(v.string()),
  genres: v.optional(v.array(Genre)),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  replayGain: v.optional(ReplayGain),
  size: v.number(),
  starred: v.optional(v.string()),
  title: v.string(),
  track: v.optional(v.number()),
  userRating: v.optional(v.number()),
  year: v.optional(v.number()),
});

export type Song = v.InferOutput<typeof Song>;

export const ReleaseDate = v.object({
  day: v.optional(v.number()),
  month: v.optional(v.number()),
  year: v.optional(v.number()),
});

export const DiscTitle = v.object({
  disc: v.number(),
  title: v.string(),
});

type DiscTitle = v.InferOutput<typeof DiscTitle>;

const Album = v.object({
  artist: v.string(),
  artistId: v.string(),
  coverArt: v.string(),
  discTitles: v.optional(v.array(DiscTitle)),
  duration: v.optional(v.number()),
  genre: v.optional(v.string()),
  genres: v.optional(v.array(Genre)),
  id: v.string(),
  isCompilation: v.optional(v.boolean()),
  musicBrainzId: v.optional(v.string()),
  name: v.string(),
  originalReleaseDate: v.optional(ReleaseDate),
  releaseDate: v.optional(ReleaseDate),
  song: v.array(Song),
  songCount: v.number(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
  year: v.optional(v.number()),
});

const AlbumInfo = v.object({
  lastFmUrl: v.optional(v.string()),
  musicBrainzId: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export type AlbumInfo = v.InferOutput<typeof AlbumInfo>;

const BaseAlbum = v.object({
  artist: v.string(),
  artistId: v.string(),
  coverArt: v.string(),
  duration: v.optional(v.number()),
  genre: v.optional(v.string()),
  genres: v.optional(v.array(Genre)),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  name: v.string(),
  songCount: v.number(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
  year: v.optional(v.number()),
});

export type BaseAlbum = v.InferOutput<typeof BaseAlbum>;

const Artist = v.object({
  album: v.optional(v.array(BaseAlbum)),
  albumCount: v.number(),
  coverArt: v.string(),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  name: v.string(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
});

const ArtistInfoWithoutSimilarArtist = v.object({
  biography: v.optional(v.string()),
  lastFmUrl: v.optional(v.string()),
  musicBrainzId: v.optional(v.string()),
});

export type ArtistInfoWithoutSimilarArtist = v.InferOutput<
  typeof ArtistInfoWithoutSimilarArtist
>;

const BaseArtist = v.object({
  albumCount: v.number(),
  coverArt: v.string(),
  id: v.string(),
  musicBrainzId: v.optional(v.string()),
  name: v.string(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
});

export type BaseArtist = v.InferOutput<typeof BaseArtist>;

const SimilarArtist = v.union([BaseArtist, v.object({ name: v.string() })]);

export type SimilarArtist = v.InferOutput<typeof SimilarArtist>;

const ArtistInfo = v.intersect([
  ArtistInfoWithoutSimilarArtist,
  v.object({
    similarArtist: v.optional(v.array(SimilarArtist)),
  }),
]);

type ArtistInfo = v.InferOutput<typeof ArtistInfo>;

const Artists = v.object({
  index: v.array(
    v.object({
      artist: v.array(BaseArtist),
      name: v.string(),
    }),
  ),
});

export const Credentials = v.object({
  salt: v.string(),
  serverBaseUrl: v.string(),
  token: v.string(),
  username: v.string(),
});

export type Credentials = v.InferOutput<typeof Credentials>;

type SubsonicRequestParam = { TAG: 0; _0: string[] } | { TAG: 1; _0: string };

type SubsonicRequestParams = Record<string, SubsonicRequestParam>;

interface SubsonicRequest {
  _method: string;
  params: SubsonicRequestParams;
}

function buildSubsonicApiUrl(
  { salt, serverBaseUrl, token, username }: Credentials,
  request: SubsonicRequest,
) {
  const url = new URL(request._method, serverBaseUrl);
  url.searchParams.set('c', 'Violette');
  url.searchParams.set('f', 'json');
  url.searchParams.set('s', salt);
  url.searchParams.set('t', token);
  url.searchParams.set('u', username);
  url.searchParams.set('v', '1.8.0');

  Object.entries(request.params).forEach(([key, value]) => {
    if (value.TAG === 0) {
      value._0.forEach(val => url.searchParams.append(key, val));
    } else {
      url.searchParams.set(key, value._0);
    }
  });

  return url;
}

export type SubsonicRequestError =
  | { kind: 'no-credentials' }
  | { kind: 'network-error' }
  | { kind: 'request-failed'; status: number; statusText: string }
  | { kind: 'non-json-content-type'; actual: string | undefined }
  | { kind: 'api-error'; code: number; message: string };

function makeRequest<T extends v.ObjectEntries>(
  method: string,
  { entries, params = {} }: { entries: T; params?: SubsonicRequestParams },
) {
  return Fx.bind(
    Fx.ask<{ credentials: Credentials | undefined }>(),
    ({ credentials }) => {
      if (!credentials) return Fx.Err({ kind: 'no-credentials' });

      const okResponse = v.object({
        status: v.literal('ok'),
        ...entries,
      });

      const responseSchema = v.object({
        'subsonic-response': okResponse,
      });

      return Fx.Async<
        v.InferOutput<typeof okResponse>,
        SubsonicRequestError,
        unknown
      >(async () => {
        let response: Response | undefined;

        try {
          response = await fetch(
            buildSubsonicApiUrl(credentials, { _method: method, params }),
          );
        } catch {
          return Fx.Err({ kind: 'network-error' });
        }

        if (!response.ok) {
          return Fx.Err({
            kind: 'request-failed',
            status: response.status,
            statusText: response.statusText,
          });
        }

        const contentType = response.headers
          .get('content-type')
          ?.split(';')
          .at(0);

        if (contentType !== 'application/json') {
          return Fx.Err({ kind: 'non-json-content-type', actual: contentType });
        }

        return response.json().then(json => {
          try {
            const result = v.parse(responseSchema, json)['subsonic-response'];

            return Fx.Ok(result);
          } catch {
            const subsonicResponse = v.parse(
              v.object({
                'subsonic-response': v.object({
                  status: v.literal('failed'),
                  error: v.object({
                    code: v.number(),
                    message: v.string(),
                  }),
                }),
              }),
              json,
            )['subsonic-response'];

            return Fx.Err({
              kind: 'api-error',
              code: subsonicResponse.error.code,
              message: subsonicResponse.error.message,
            });
          }
        });
      });
    },
  );
}

export function getAlbum(id: string) {
  return Fx.map(
    makeRequest('rest/getAlbum', {
      params: { id: { TAG: 1, _0: id } },
      entries: { album: Album },
    }),
    response => response.album,
  );
}

export function getAlbumInfo2(id: string) {
  return Fx.map(
    makeRequest('rest/getAlbumInfo2', {
      params: { id: { TAG: 1, _0: id } },
      entries: { albumInfo: AlbumInfo },
    }),
    response => response.albumInfo,
  );
}

export function getArtist(id: string) {
  return Fx.map(
    makeRequest('rest/getArtist', {
      params: { id: { TAG: 1, _0: id } },
      entries: { artist: Artist },
    }),
    response => response.artist,
  );
}

export function getArtistInfo2(
  id: string,
  count?: number,
  includeNotPresent?: boolean,
) {
  const params: SubsonicRequestParams = { id: { TAG: 1, _0: id } };

  if (count != null) {
    params.count = { TAG: 1, _0: count.toString() };
  }

  if (includeNotPresent != null) {
    params.includeNotPresent = { TAG: 1, _0: includeNotPresent.toString() };
  }

  return Fx.map(
    makeRequest('rest/getArtistInfo2', {
      params,
      entries: { artistInfo2: ArtistInfo },
    }),
    ({ artistInfo2 }) => {
      return {
        ...artistInfo2,
        similarArtist: artistInfo2.similarArtist?.map(similarArtist =>
          'id' in similarArtist
            ? { TAG: 0 as const, _0: similarArtist }
            : { TAG: 1 as const, _0: similarArtist },
        ),
      };
    },
  );
}

export function getArtists() {
  return Fx.map(
    makeRequest('rest/getArtists', { entries: { artists: Artists } }),
    response => response.artists,
  );
}

export function getCoverArt(
  credentials: Credentials,
  coverArt: string,
  size?: number,
) {
  const params: SubsonicRequestParams = { id: { TAG: 1, _0: coverArt } };

  if (size != null) {
    params.size = { TAG: 1, _0: size.toString() };
  }

  return buildSubsonicApiUrl(credentials, {
    _method: 'rest/getCoverArt',
    params,
  }).href;
}

export function getPlayQueue() {
  return Fx.map(
    makeRequest('rest/getPlayQueue', {
      entries: {
        playQueue: v.optional(
          v.object({
            changed: v.string(),
            changedBy: v.string(),
            current: v.optional(v.union([v.number(), v.string()])),
            entry: v.array(Song),
            position: v.optional(v.number()),
            username: v.string(),
          }),
        ),
      },
    }),
    response => response.playQueue,
  );
}

export function getSong(id: string) {
  return Fx.map(
    makeRequest('rest/getSong', {
      params: { id: { TAG: 1, _0: id } },
      entries: { song: Song },
    }),
    response => response.song,
  );
}

export function getTopSongs(artistName: string, count?: number) {
  const params: SubsonicRequestParams = {
    artist: { TAG: 1, _0: artistName },
  };

  if (count != null) {
    params.count = { TAG: 1, _0: count.toString() };
  }

  return Fx.map(
    makeRequest('rest/getTopSongs', {
      params,
      entries: {
        topSongs: v.object({
          song: v.optional(v.array(Song)),
        }),
      },
    }),
    response => response.topSongs.song,
  );
}

export function ping() {
  return Fx.map(makeRequest('rest/ping', { entries: {} }), () => undefined);
}

export function savePlayQueue(id: string[], current?: string, position = 0) {
  const params: SubsonicRequestParams = { id: { TAG: 0, _0: id } };

  if (current != null) {
    params.current = { TAG: 1, _0: current };
  }

  if (position != null) {
    params.position = { TAG: 1, _0: position.toString() };
  }

  return Fx.map(
    makeRequest('rest/savePlayQueue', { params, entries: {} }),
    () => undefined,
  );
}

export function scrobble(id: string, submission?: boolean, time?: number) {
  const params: SubsonicRequestParams = { id: { TAG: 1, _0: id } };

  if (submission != null) {
    params.submission = { TAG: 1, _0: submission.toString() };
  }

  if (time != null) {
    params.time = { TAG: 1, _0: time.toString() };
  }

  return Fx.map(
    makeRequest('rest/scrobble', { params, entries: {} }),
    () => undefined,
  );
}

export function star({
  albumId,
  artistId,
  id,
}: {
  albumId?: string;
  artistId?: string;
  id?: string;
}) {
  const params: SubsonicRequestParams = {};

  if (albumId != null) {
    params.albumId = { TAG: 1, _0: albumId };
  }

  if (artistId != null) {
    params.artistId = { TAG: 1, _0: artistId };
  }

  if (id != null) {
    params.id = { TAG: 1, _0: id };
  }

  return Fx.map(
    makeRequest('rest/star', { params, entries: {} }),
    () => undefined,
  );
}

export function streamUrl(credentials: Credentials, id: string) {
  return buildSubsonicApiUrl(credentials, {
    _method: 'rest/stream',
    params: { id: { TAG: 1, _0: id } },
  }).href;
}

export function unstar({
  albumId,
  artistId,
  id,
}: {
  albumId?: string;
  artistId?: string;
  id?: string;
}) {
  const params: SubsonicRequestParams = {};

  if (albumId != null) {
    params.albumId = { TAG: 1, _0: albumId };
  }

  if (artistId != null) {
    params.artistId = { TAG: 1, _0: artistId };
  }

  if (id != null) {
    params.id = { TAG: 1, _0: id };
  }

  return Fx.map(
    makeRequest('rest/unstar', { params, entries: {} }),
    () => undefined,
  );
}
