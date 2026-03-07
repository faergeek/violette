import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAppStore } from '../store/context';
import { Button } from './button';
import { Container } from './container';
import { H2 } from './h2';
import css from './queue.module.css';
import { useQueueContext } from './queueContext';
import { useScrollLock } from './scrollLock';
import { SongList } from './songList';

export function Queue({
  id,
  triggerRef,
}: {
  id: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const currentSongId = useAppStore(state => state.player.currentSongId);
  const queuedSongIds = useAppStore(state => state.player.queuedSongIds);
  const lockScroll = useScrollLock();
  const { isOpen, setIsOpen } = useQueueContext();
  const currentSongIdRef = useRef(currentSongId);

  useEffect(() => {
    currentSongIdRef.current = currentSongId;
  }, [currentSongId]);

  useEffect(() => {
    if (isOpen) {
      lockScroll(true);

      if (currentSongIdRef.current != null) {
        const currentSongElement = document.getElementById(
          `now-playing-queue-${currentSongIdRef.current}`,
        );

        if (currentSongElement) {
          currentSongElement.querySelector('button')?.focus();

          currentSongElement.scrollIntoView({
            behavior: 'instant',
            block: 'end',
          });
        }
      }
    } else {
      if (rootRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    }

    return () => {
      lockScroll(false);
    };
  }, [isOpen, lockScroll, triggerRef]);

  return (
    <div
      ref={rootRef}
      className={css.root}
      id={id}
      onKeyDown={event => {
        if (event.code !== 'Escape') return;

        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
      }}
    >
      <div className={css.header}>
        <Container className={css.headerContainer}>
          <H2>Now playing</H2>

          <Button
            aria-label="Close"
            className={css.headerCloseButton}
            variant="icon"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <XIcon role="none" />
          </Button>
        </Container>
      </div>

      <div className={css.body}>
        <Container className={css.bodyContainer}>
          <SongList
            getSongElementId={param => `now-playing-queue-${param}`}
            isQueueView
            songIds={queuedSongIds}
          />
        </Container>
      </div>
    </div>
  );
}
