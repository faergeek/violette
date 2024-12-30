import * as v from 'valibot';

export const SubsonicCredentials = v.object({
  salt: v.string(),
  serverBaseUrl: v.string(),
  token: v.string(),
  username: v.string(),
});

export type SubsonicCredentials = v.InferInput<typeof SubsonicCredentials>;

export type SubsonicRequest =
  | { method: 'rest/ping' }
  | { method: 'rest/getLicense' }
  | { method: 'rest/getArtists' }
  | { method: 'rest/getArtist'; id: string }
  | {
      method: 'rest/getArtistInfo2';
      id: string;
      count?: number;
      includeNotPresent?: boolean;
    }
  | { method: 'rest/getAlbum'; id: string }
  | { method: 'rest/getAlbumInfo2'; id: string }
  | { method: 'rest/getTopSongs'; artist: string; count?: number }
  | { method: 'rest/getPlayQueue' }
  | {
      method: 'rest/savePlayQueue';
      id: string[];
      current?: string;
      position?: number;
    }
  | {
      method: 'rest/stream';
      converted?: boolean;
      estimateContentLength?: boolean;
      format?: 'flac' | 'mp3' | 'raw';
      id: string;
      maxBitRate?: number;
    }
  | { method: 'rest/getCoverArt'; id: string; size?: number };

const SubsonicResponseJsonCommon = v.object({
  openSubsonic: v.optional(v.boolean()),
  serverVersion: v.optional(v.string()),
  type: v.optional(v.string()),
  version: v.string(),
});

export const SubsonicResponseJsonOk = v.object({
  ...SubsonicResponseJsonCommon.entries,
  status: v.literal('ok'),
});

export type SubsonicResponseJsonOk = v.InferInput<
  typeof SubsonicResponseJsonOk
>;

export const SubsonicResponseJsonFailed = v.object({
  ...SubsonicResponseJsonCommon.entries,
  status: v.literal('failed'),
  error: v.object({
    code: v.number(),
    message: v.string(),
  }),
});

export type SubsonicResponseJsonFailed = v.InferInput<
  typeof SubsonicResponseJsonFailed
>;

export type SubsonicError =
  | { type: 'network-error'; error: unknown }
  | { type: 'request-failed'; status: number; statusText: string }
  | { type: 'non-json-content-type'; actual: string | null }
  | { type: 'api-error'; code: number; message: string }
  | { type: 'validation-failed'; issues: unknown };

const ReplayGain = v.partial(
  v.object({
    albumGain: v.number(),
    albumPeak: v.number(),
    trackGain: v.number(),
    trackPeak: v.number(),
  }),
);

export const BaseArtist = v.object({
  coverArt: v.string(),
  id: v.string(),
  name: v.string(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
});

export type BaseArtist = v.InferInput<typeof BaseArtist>;

export const BaseAlbum = v.object({
  artist: v.string(),
  artistId: v.string(),
  coverArt: v.string(),
  id: v.string(),
  name: v.string(),
  starred: v.optional(v.string()),
  userRating: v.optional(v.number()),
  year: v.optional(v.number()),
});

export type BaseAlbum = v.InferInput<typeof BaseAlbum>;

export const BaseSong = v.object({
  album: v.string(),
  albumId: v.string(),
  artist: v.string(),
  artistId: v.optional(v.string()),
  coverArt: v.string(),
  duration: v.number(),
  id: v.string(),
  replayGain: v.optional(ReplayGain),
  starred: v.optional(v.string()),
  title: v.string(),
  track: v.optional(v.number()),
  userRating: v.optional(v.number()),
});

export type BaseSong = v.InferInput<typeof BaseSong>;

export const Song = v.object({
  ...BaseSong.entries,
  discNumber: v.optional(v.number()),
  genre: v.optional(v.string()),
  genres: v.optional(v.array(v.object({ name: v.string() }))),
  musicBrainzId: v.optional(v.string()),
  replayGain: v.optional(ReplayGain),
  size: v.number(),
  year: v.optional(v.number()),
});

export type Song = v.InferInput<typeof Song>;
