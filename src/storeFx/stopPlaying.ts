import { pause } from './pause';
import { setCurrentTime } from './setCurrentTime';

export function stopPlaying() {
  return pause().flatMap(() => setCurrentTime(0));
}
