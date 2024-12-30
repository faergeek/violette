import { useEffect, useMemo, useRef, useState } from 'react';

import { useStoreState } from '../store/react';
import { formatDuration } from './formatDuration';

function clientXToPosition({
  clientX,
  duration,
  width,
}: {
  clientX: number;
  duration: number;
  width: number;
}) {
  return Math.max(0, Math.min((duration * clientX) / width, duration));
}

export function PlayerPosition() {
  const audio = useStoreState(state => state.audio);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [buffered, setBuffered] = useState<TimeRanges>();
  const [currentTime, setCurrentTime] = useState<number>();
  const [duration, setDuration] = useState<number>();
  useEffect(() => {
    const abortController = new AbortController();

    const updateAudioState = () => {
      setBuffered(audio.buffered);
      setCurrentTime(audio.currentTime);
      setDuration(isFinite(audio.duration) ? audio.duration : undefined);
    };

    const listenerOptions = {
      capture: true,
      passive: true,
      signal: abortController.signal,
    };

    audio.addEventListener('durationchange', updateAudioState, listenerOptions);
    audio.addEventListener('emptied', updateAudioState, listenerOptions);
    audio.addEventListener('ended', updateAudioState, listenerOptions);
    audio.addEventListener('loadstart', updateAudioState, listenerOptions);
    audio.addEventListener('loadeddata', updateAudioState, listenerOptions);
    audio.addEventListener('loadedmetadata', updateAudioState, listenerOptions);
    audio.addEventListener('timeupdate', updateAudioState, listenerOptions);

    return () => abortController.abort();
  }, [audio]);

  useEffect(() => {
    if (duration == null || currentTime == null) {
      return;
    }

    navigator.mediaSession.setPositionState({
      duration,
      position: currentTime,
    });
  }, [currentTime, duration]);

  useEffect(() => {
    navigator.mediaSession.setActionHandler('seekto', details => {
      if (!details.seekTime) return;

      navigator.mediaSession.setPositionState({
        position: details.seekTime,
      });

      audio.currentTime = details.seekTime;
    });
  }, [audio]);

  const [pointerIdToCapture, setPointerIdToCapture] = useState<number>();
  const [draggedToPosition, setDraggedToPosition] = useState<number>();

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || pointerIdToCapture == null) return;

    rootEl.setPointerCapture(pointerIdToCapture);

    return () => {
      rootEl.releasePointerCapture(pointerIdToCapture);
    };
  }, [pointerIdToCapture]);

  function releasePoinerCapture() {
    if (draggedToPosition == null) return;
    audio.currentTime = draggedToPosition;
    setCurrentTime(draggedToPosition);
    setDraggedToPosition(undefined);
    setPointerIdToCapture(undefined);
  }

  const bufferedTimeRanges = useMemo(() => {
    if (!buffered) return;

    const result = new Array<{ start: number; end: number }>(buffered.length);

    for (let i = 0; i < buffered.length; i++) {
      result[i] = {
        start: buffered.start(i),
        end: buffered.end(i),
      };
    }

    return result;
  }, [buffered]);

  const position = draggedToPosition ?? currentTime;

  return (
    <div
      ref={rootRef}
      className="relative h-5 w-full touch-pan-x select-none overflow-hidden bg-secondary"
      onPointerDownCapture={event => {
        if (duration == null) return;
        setPointerIdToCapture(event.pointerId);

        const bcr = event.currentTarget.getBoundingClientRect();

        setDraggedToPosition(
          clientXToPosition({
            clientX: event.clientX,
            duration,
            width: bcr.width,
          }),
        );
      }}
      onPointerMoveCapture={event => {
        if (
          duration == null ||
          pointerIdToCapture == null ||
          !event.currentTarget.hasPointerCapture(pointerIdToCapture)
        ) {
          return;
        }

        const bcr = event.currentTarget.getBoundingClientRect();

        setDraggedToPosition(
          clientXToPosition({
            clientX: event.clientX - bcr.left,
            duration,
            width: bcr.width,
          }),
        );
      }}
      onPointerUpCapture={releasePoinerCapture}
      onPointerCancelCapture={releasePoinerCapture}
    >
      {bufferedTimeRanges &&
        duration != null &&
        bufferedTimeRanges.map((timeRange, index) => (
          <div
            key={index}
            className="pointer-events-none absolute h-full w-full origin-left bg-muted-foreground/20"
            style={{
              transform: `translateX(${(100 * timeRange.start) / duration}%) scaleX(${(timeRange.end - timeRange.start) / duration})`,
            }}
          />
        ))}

      {duration != null && position != null && (
        <div
          className="pointer-events-none absolute h-full w-full bg-primary"
          style={{
            transform: `translateX(${(100 * position) / duration - 100}%)`,
          }}
        />
      )}

      <div className="flex px-1">
        {position != null && (
          <div className="pointer-events-none relative text-sm">
            {formatDuration(position)}
          </div>
        )}

        {duration != null && (
          <div className="pointer-events-none relative ms-auto text-sm">
            {formatDuration(duration)}
          </div>
        )}
      </div>
    </div>
  );
}
