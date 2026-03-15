import * as Fx from '../fx/fx';
import { audio } from './playerContext';

export function make() {
  return Fx.Ok(audio.pause());
}
