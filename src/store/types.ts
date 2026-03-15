import type { StoreApi } from 'zustand';

import type { StoreState } from './state';

export type Store = StoreApi<StoreState>;
