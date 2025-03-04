import { Fx } from '../shared/fx';
import { audio } from './playerContext';

export function pause() {
  return Fx.Ok(audio.pause());
}
