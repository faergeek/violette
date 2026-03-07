import { Outlet } from '@tanstack/react-router';
import { useId, useRef } from 'react';

import { Container } from './container';
import { Footer } from './footer.jsx';
import css from './layout.module.css';
import { NowPlaying } from './nowPlaying.jsx';
import { PlaybackPosition } from './playbackPosition';
import { PlayerToolbar } from './playerToolbar';
import { Queue } from './queue';
import { QueueContextConsumer, QueueContextProvider } from './queueContext';

export function Layout() {
  const queueTriggerRef = useRef<HTMLButtonElement>(null);
  const queueId = useId();

  return (
    <div className={css.root}>
      <QueueContextProvider>
        <header className={css.header}>
          <NowPlaying />
        </header>

        <main>
          <Outlet />
        </main>

        <Footer />

        <Container className={css.playerControls}>
          <PlaybackPosition />
          <PlayerToolbar queueId={queueId} queueTriggerRef={queueTriggerRef} />
        </Container>

        <QueueContextConsumer>
          {({ isOpen }) => (
            <div className={css.queue} hidden={!isOpen}>
              <Queue id={queueId} triggerRef={queueTriggerRef} />
            </div>
          )}
        </QueueContextConsumer>
      </QueueContextProvider>
    </div>
  );
}
