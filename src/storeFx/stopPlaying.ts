import * as Fx from '../fx/fx';
import * as StoreFx__Pause from './pause';
import { setCurrentTime } from './setCurrentTime';

export function stopPlaying() {
  return Fx.bind(StoreFx__Pause.make(), () => setCurrentTime(() => 0));
}
