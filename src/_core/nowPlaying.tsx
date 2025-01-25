import { useId, useRef } from 'react';

import { PlaybackPosition } from './playbackPosition';
import { PlayerToolbar } from './playerToolbar';
import { Queue } from './queue';
import { QueueContextProvider } from './queueContext';

export function NowPlaying() {
  const queueTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queueId = useId();

  return (
    <QueueContextProvider>
      <div className="sticky bottom-0 isolate h-[var(--now-playing-height)]">
        <Queue id={queueId} triggerRef={queueTriggerRef} />
        <PlaybackPosition />
        <PlayerToolbar queueId={queueId} queueTriggerRef={queueTriggerRef} />
      </div>
    </QueueContextProvider>
  );
}
