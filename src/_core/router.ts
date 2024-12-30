import type { StoreApi } from 'zustand';

import type { StoreState } from '../store/types';

export interface RouterContext {
  store: StoreApi<StoreState>;
}
