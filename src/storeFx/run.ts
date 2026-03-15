import * as Fx from '../fx/fx';
import { useStore } from '../store/context';
import type { Store } from '../store/types';

export function useStoreFxRun() {
  const store = useStore();

  return <Ok, Err>(fx: Fx.Fx<Ok, Err, { store: Store }>) =>
    Fx.run(fx, { store });
}
