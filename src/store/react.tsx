import { createContext, useCallback, useContext } from 'react';
import invariant from 'tiny-invariant';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';

import type { StoreState } from './types';

const StoreContext = createContext<StoreApi<StoreState> | null>(null);

export function StoreProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: StoreApi<StoreState> | null;
}) {
  return <StoreContext value={store}>{children}</StoreContext>;
}

function useStoreFromContext() {
  const store = useContext(StoreContext);
  invariant(store);
  return store;
}

export function useStoreState<T>(selector: (state: StoreState) => T) {
  return useStore(useStoreFromContext(), selector);
}

export function useStoreMutations() {
  return useStore(useStoreFromContext(), state => state.mutations);
}

export type StoreMutator<T> = (store: StoreApi<StoreState>) => T;

export function useStoreMutate() {
  const store = useStoreFromContext();

  return useCallback(
    function mutateStore<T>(fn: StoreMutator<T>) {
      return fn(store);
    },
    [store],
  );
}
