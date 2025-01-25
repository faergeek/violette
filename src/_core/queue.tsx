import clsx from 'clsx';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAppStore } from '../store/react';
import { Button } from './button';
import { H2 } from './headings';
import { useQueueContext } from './queueContext';
import { SongList } from './songList';
import { useScrollLock } from './useScrollLock';

export function Queue({
  id,
  triggerRef,
}: {
  id: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
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

        currentSongElement?.querySelector('button')?.focus();
        currentSongElement?.scrollIntoView({ block: 'center' });
      }
    } else {
      if (rootRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    }

    return () => lockScroll(false);
  }, [isOpen, lockScroll, triggerRef]);

  return (
    <div
      ref={rootRef}
      className={clsx(
        'fixed inset-0 bottom-[var(--now-playing-height)] isolate m-0 w-full flex-col overflow-auto border border-b-0 bg-background p-0',
        {
          hidden: !isOpen,
          'flex animate-in fade-in-0 slide-in-from-bottom-20': isOpen,
        },
      )}
      id={id}
      onKeyDown={event => {
        switch (event.code) {
          case 'Escape':
            event.preventDefault();
            event.stopPropagation();
            setIsOpen(false);
            break;
        }
      }}
    >
      <div className="container mx-auto flex items-center px-4">
        <H2>Now playing</H2>

        <Button
          aria-label="Close"
          className="ms-auto p-3"
          variant="icon"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <X role="none" />
        </Button>
      </div>

      <div className="overflow-auto border-t">
        <div className="container mx-auto px-4">
          <SongList
            getSongElementId={songId => `now-playing-queue-${songId}`}
            isQueueView
            songIds={queuedSongIds}
          />
        </div>
      </div>
    </div>
  );
}
