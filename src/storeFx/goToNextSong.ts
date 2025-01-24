import { startPlaying } from './startPlaying';

export function goToNextSong() {
  return startPlaying(({ current, queued }) => ({
    current:
      queued[
        ((current == null ? 0 : queued.indexOf(current)) + 1) % queued.length
      ],
  }));
}
