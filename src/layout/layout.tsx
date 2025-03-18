import { Outlet } from '@tanstack/react-router';
import { useId, useRef } from 'react';

import { Footer } from '../_core/footer';
import { NowPlaying } from '../_core/nowPlaying';
import { PlaybackPosition } from '../_core/playbackPosition';
import { PlayerToolbar } from '../_core/playerToolbar';
import { Queue } from '../_core/queue';
import {
  QueueContextConsumer,
  QueueContextProvider,
} from '../_core/queueContext';

export function Layout() {
  const queueTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queueId = useId();

  return (
    <div className="relative flex min-h-lvh flex-col">
      <QueueContextProvider>
        <header className="sticky top-0 z-30 bg-background">
          <NowPlaying />
        </header>

        <main>
          <Outlet />
        </main>

        <Footer />

        <div className="container sticky bottom-0 z-50 mx-auto sm:px-4">
          <PlaybackPosition />
          <PlayerToolbar queueId={queueId} queueTriggerRef={queueTriggerRef} />
        </div>

        <QueueContextConsumer>
          {({ isOpen }) => (
            <div
              className="fixed inset-0 bottom-[var(--player-toolbar-height)] isolate z-40 bg-background"
              hidden={!isOpen}
            >
              <Queue id={queueId} triggerRef={queueTriggerRef} />
            </div>
          )}
        </QueueContextConsumer>
      </QueueContextProvider>
    </div>
  );
}
