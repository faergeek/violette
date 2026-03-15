import * as v from 'valibot';

import type {
  AlbumInfo,
  ArtistInfoWithoutSimilarArtist,
  BaseAlbum,
  BaseArtist,
  Credentials,
  SimilarArtist,
  Song,
} from '../subsonic';
import { DiscTitle, ReleaseDate } from '../subsonic';

const AlbumDetails = v.object({
  discTitles: v.optional(v.array(DiscTitle)),
  isCompilation: v.optional(v.boolean()),
  originalReleaseDate: v.optional(ReleaseDate),
  releaseDate: v.optional(ReleaseDate),
});

type AlbumDetails = v.InferOutput<typeof AlbumDetails>;

export const ReplayGainOptions = v.object({
  preAmp: v.number(),
  preferredGain: v.optional(v.union([v.literal('album'), v.literal('track')])),
});

export type ReplayGainOptions = v.InferOutput<typeof ReplayGainOptions>;

export interface StoreState {
  albums: {
    baseById: Map<string, BaseAlbum>;
    detailsById: Map<string, AlbumDetails>;
    infoById: Map<string, AlbumInfo>;
    songIdsById: Map<string, string[]>;
  };
  artists: {
    albumIdsByArtistId: Map<string, string[]>;
    artistInfoById: Map<string, ArtistInfoWithoutSimilarArtist>;
    byId: Map<string, BaseArtist>;
    listIds?: string[];
    similarArtistsById: Map<
      string,
      Array<
        | { TAG: 0; _0: Extract<SimilarArtist, { id: unknown }> }
        | { TAG: 1; _0: Exclude<SimilarArtist, { id: unknown }> }
      >
    >;
    topSongIdsByArtistName: Map<string, string[]>;
  };
  auth: {
    clearSubsonicCredentials: () => void;
    credentials?: Credentials;
    saveSubsonicCredentials: (credentials: Credentials) => void;
  };
  player: {
    buffered: Array<{ end: number; start: number }>;
    currentSongId?: string;
    currentTime: number;
    duration?: number;
    muted: boolean;
    paused: boolean;
    queuedSongIds: string[];
    replayGainOptions: ReplayGainOptions;
    volume: number;
  };
  songs: { byId: Map<string, Song> };
}
