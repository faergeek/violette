import * as v from 'valibot';
import { createStore } from 'zustand';

import { SubsonicCredentials } from '../api/types';
import type { StoreState } from './types';

const CREDENTIALS_LOCAL_STORAGE_KEY = 'subsonic-credentials';

export function createAppStore() {
  return createStore<StoreState>()((set, get, store) => {
    const credentialsParseResult = v.safeParse(
      SubsonicCredentials,
      JSON.parse(String(localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_KEY))),
    );

    function clearSubsonicCredentials() {
      return set({ credentials: undefined });
    }

    function saveSubsonicCredentials(credentials: SubsonicCredentials) {
      return set({ credentials });
    }

    store.subscribe((state, prevState) => {
      if (state.credentials === prevState.credentials) return;

      if (state.credentials == null) {
        localStorage.removeItem(CREDENTIALS_LOCAL_STORAGE_KEY);
      } else {
        localStorage.setItem(
          CREDENTIALS_LOCAL_STORAGE_KEY,
          JSON.stringify(state.credentials),
        );
      }
    });

    return {
      audio: new Audio(),
      credentials: credentialsParseResult.success
        ? credentialsParseResult.output
        : undefined,
      paused: true,
      queuedSongs: [],

      mutations: {
        clearSubsonicCredentials,
        saveSubsonicCredentials,
      },
    };
  });
}
