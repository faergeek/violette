import { createContext, useContext } from 'react';
import * as zustand from 'zustand';

import type { StoreState } from './state';
import type { Store } from './types';

const Context = createContext<Store | null>(null);

export function StoreProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: Store;
}) {
  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useStore() {
  const value = useContext(Context);

  if (!value) {
    throw new Error('useStore must be used within store provider');
  }

  return value;
}

export function useAppStore<T>(selector: (state: StoreState) => T): T {
  return zustand.useStore(useStore(), selector);
}

export function Consumer<T>({
  children,
  selector,
}: {
  children: (value: T) => React.ReactNode;
  selector: (state: StoreState) => T;
}) {
  return children(useAppStore(selector));
}
