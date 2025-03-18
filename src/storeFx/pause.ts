import { Fx } from '../_core/fx';
import { audio } from './playerContext';

export function pause() {
  return Fx.Ok(audio.pause());
}
