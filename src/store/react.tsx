import { createContext, useContext } from 'react';
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

export function StoreStateConsumer<T>({
  children,
  selector,
}: {
  children: (value: T) => React.ReactNode;
  selector: (state: Omit<StoreState, 'mutations'>) => T;
}) {
  return children(useStore(useStoreFromContext(), selector));
}

export function useStoreMutations() {
  return useStore(useStoreFromContext(), state => state.mutations);
}
