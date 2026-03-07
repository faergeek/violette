import * as Fx from '../fx/fx';
import { useStore } from '../store/context';
import type { Store } from '../store/types';

export function use() {
  const store = useStore();

  return <Ok, Err>(fx: Fx.Fx<Ok, Err, { store: Store }>) =>
    Fx.runAsync(fx, { store });
}
