import { invariant } from '@tanstack/react-router';
import { createContext, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';

import type { Fx } from '../_core/fx';
import type { AppStore, StoreState } from './create';

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

export function useAppStore<T>(selector: (state: StoreState) => T) {
  return useStore(useStoreFromContext(), selector);
}

export function useRunStoreFx() {
  const store = useStoreFromContext();

  return <T, E>(fx: Fx<T, E, { store: AppStore }>) => fx.runAsync({ store });
}

export function StoreConsumer<T>({
  children,
  selector,
}: {
  children: (value: T) => React.ReactNode;
  selector: (state: StoreState) => T;
}) {
  return children(useStore(useStoreFromContext(), selector));
}
