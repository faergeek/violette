import * as Fx from '../fx/fx';
import { goToNextSong } from './goToNextSong';
import { goToPrevSong } from './goToPrevSong';
import * as StoreFx__Pause from './pause';
import * as StoreFx__Play from './play';
import { setCurrentTime } from './setCurrentTime';
import { stopPlaying } from './stopPlaying';

export function handleMediaSessionAction(event: MediaSessionActionDetails) {
  switch (event.action) {
    case 'nexttrack':
      return goToNextSong();
    case 'pause':
      return StoreFx__Pause.make();
    case 'play':
      return StoreFx__Play.make();
    case 'previoustrack':
      return goToPrevSong();
    case 'seekbackward': {
      const seekOffset = event.seekOffset;
      if (seekOffset == null) return Fx.Ok();

      return setCurrentTime(currentTime => currentTime - seekOffset);
    }
    case 'seekforward': {
      const seekOffset = event.seekOffset;
      if (seekOffset == null) return Fx.Ok();

      return setCurrentTime(currentTime => currentTime + seekOffset);
    }
    case 'seekto': {
      const seekTime = event.seekTime;
      if (seekTime == null) return Fx.Ok();

      return setCurrentTime(() => seekTime);
    }
    case 'stop':
      return stopPlaying();
    default:
      return Fx.Ok();
  }
}
