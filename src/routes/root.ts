import { createRootRoute, type Register } from '@tanstack/react-router';

import type { Store } from '../store/types';

export const route = createRootRoute<Register, unknown, { store: Store }>();
