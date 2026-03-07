import * as v from 'valibot';
import { createStore } from 'zustand';

import { Credentials } from '../subsonic';
import type { StoreState } from './state';
import { ReplayGainOptions } from './state';

const CREDENTIALS_LOCAL_STORAGE_KEY = 'subsonic-credentials';
export const REPLAY_GAIN_LOCAL_STORAGE_KEY = 'replayGain';

type SetStoreState = (
  partial:
    | StoreState
    | Partial<StoreState>
    | ((state: StoreState) => StoreState | Partial<StoreState>),
  replace?: false,
) => void;

export function createAppStore() {
  const savedCredentials = localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_KEY);

  let credentials: Credentials | undefined;
  if (savedCredentials) {
    let credentialsRaw: unknown;
    try {
      credentialsRaw = JSON.parse(savedCredentials);
    } catch {
      // ignore parsing failures
    }

    const result = v.safeParse(Credentials, credentialsRaw);
    if (result.success) credentials = result.output;
  }

  const savedReplayGainOptions = localStorage.getItem(
    REPLAY_GAIN_LOCAL_STORAGE_KEY,
  );

  let replayGainOptions: ReplayGainOptions | undefined;
  let replayGainOptionsRaw: unknown;
  if (savedReplayGainOptions) {
    try {
      replayGainOptionsRaw = JSON.parse(savedReplayGainOptions);
    } catch {
      // ignore parsing failures
    }

    const result = v.safeParse(ReplayGainOptions, replayGainOptionsRaw);
    if (result.success) replayGainOptions = result.output;
  }

  replayGainOptions ??= { preAmp: 0 };

  function clearSubsonicCredentials(set: SetStoreState) {
    set(
      prevState => ({ auth: { ...prevState.auth, credentials: undefined } }),
      false,
    );

    localStorage.removeItem(CREDENTIALS_LOCAL_STORAGE_KEY);
  }

  function saveSubsonicCredentials(
    set: SetStoreState,
    newCredentials: Credentials,
  ) {
    set(
      prevState => ({
        auth: { ...prevState.auth, credentials: newCredentials },
      }),
      false,
    );

    localStorage.setItem(
      CREDENTIALS_LOCAL_STORAGE_KEY,
      JSON.stringify(newCredentials),
    );
  }

  return createStore<StoreState>(set => ({
    albums: {
      baseById: new Map(),
      detailsById: new Map(),
      infoById: new Map(),
      songIdsById: new Map(),
    },
    artists: {
      albumIdsByArtistId: new Map(),
      artistInfoById: new Map(),
      byId: new Map(),
      similarArtistsById: new Map(),
      topSongIdsByArtistName: new Map(),
    },
    auth: {
      credentials,
      clearSubsonicCredentials: clearSubsonicCredentials.bind(null, set),
      saveSubsonicCredentials: saveSubsonicCredentials.bind(null, set),
    },
    player: {
      buffered: [],
      currentSongId: undefined,
      currentTime: 0,
      duration: undefined,
      muted: false,
      paused: true,
      queuedSongIds: [],
      replayGainOptions,
      volume: 1,
    },
    songs: {
      byId: new Map(),
    },
  }));
}
