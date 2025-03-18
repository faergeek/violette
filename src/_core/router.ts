import type { StoreApi } from 'zustand';

import type { StoreState } from '../store/create';

export interface RouterContext {
  store: StoreApi<StoreState>;
}
