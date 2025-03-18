import { Fx } from '../_core/fx';
import { goToNextSong } from './goToNextSong';
import { goToPrevSong } from './goToPrevSong';
import { pause } from './pause';
import { play } from './play';
import { setCurrentTime } from './setCurrentTime';
import { stopPlaying } from './stopPlaying';

export function handleMediaSessionAction(event: MediaSessionActionDetails) {
  switch (event.action) {
    case 'play':
      return play();
    case 'pause':
      return pause();
    case 'stop':
      return stopPlaying();
    case 'seekto': {
      const { seekTime } = event;

      if (seekTime != null) {
        return setCurrentTime(seekTime);
      }
      break;
    }
    case 'seekforward': {
      const { seekOffset } = event;

      if (seekOffset != null) {
        return setCurrentTime(currentTime => currentTime + seekOffset);
      }
      break;
    }
    case 'seekbackward': {
      const { seekOffset } = event;

      if (seekOffset != null) {
        return setCurrentTime(currentTime => currentTime - seekOffset);
      }
      break;
    }
    case 'previoustrack':
      return goToPrevSong();
    case 'nexttrack':
      return goToNextSong();
  }

  return Fx.Ok();
}
