import type { StateCreator } from 'zustand';

import { getLocalStorageValue } from '../_core/localStorage';
import { SubsonicCredentials } from '../api/types';
import type { StoreState } from '../store/create';

const CREDENTIALS_LOCAL_STORAGE_KEY = 'subsonic-credentials';

export interface AuthSlice {
  clearSubsonicCredentials: () => void;
  credentials: SubsonicCredentials | undefined;
  saveSubsonicCredentials: (credentials: SubsonicCredentials) => void;
}

export const authSlice: StateCreator<StoreState, [], [], AuthSlice> = (
  set,
  get,
): AuthSlice => ({
  clearSubsonicCredentials() {
    set(prevState => ({
      auth: {
        ...prevState.auth,
        credentials: undefined,
      },
    }));

    localStorage.removeItem(CREDENTIALS_LOCAL_STORAGE_KEY);
  },
  credentials: getLocalStorageValue(
    CREDENTIALS_LOCAL_STORAGE_KEY,
    SubsonicCredentials,
  ).toOptional(),
  saveSubsonicCredentials(credentials) {
    set(prevState => ({
      auth: {
        ...prevState.auth,
        credentials,
      },
    }));

    const { player } = get();

    player.init(credentials);

    localStorage.setItem(
      CREDENTIALS_LOCAL_STORAGE_KEY,
      JSON.stringify(credentials),
    );
  },
});
