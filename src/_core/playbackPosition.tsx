import clsx from 'clsx';
import { useState } from 'react';

import { useAppStore, useRunAsyncStoreFx } from '../store/react';
import { setCurrentTime } from '../storeFx/setCurrentTime';
import { formatDuration } from './formatDuration';

export function PlaybackPosition() {
  const buffered = useAppStore(state => state.player.buffered);
  const currentTime = useAppStore(state => state.player.currentTime);
  const duration = useAppStore(state => state.player.duration);
  const runAsyncStoreFx = useRunAsyncStoreFx();

  const [draggedToTime, setDraggedToTime] = useState<number>();
  const [hoverInfo, setHoverInfo] = useState<{ x: number; time: number }>();

  function clientXToTime(params: {
    duration: number;
    offsetX: number;
    width: number;
  }) {
    return Math.max(
      0,
      Math.min(
        (params.duration * params.offsetX) / params.width,
        params.duration,
      ),
    );
  }

  function releasePoinerCapture(event: React.PointerEvent<HTMLDivElement>) {
    if (draggedToTime != null) runAsyncStoreFx(setCurrentTime(draggedToTime));

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDraggedToTime(undefined);
    setHoverInfo(undefined);
  }

  return (
    <div
      aria-label="Playback position"
      aria-valuemax={duration ?? 0}
      aria-valuenow={draggedToTime ?? currentTime}
      aria-valuetext={formatDuration(draggedToTime ?? currentTime)}
      className="relative flex h-4 touch-none select-none overflow-hidden bg-secondary text-xs slashed-zero tabular-nums text-white"
      role="slider"
      tabIndex={0}
      onPointerDownCapture={event => {
        if (duration == null || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);

        const bcr = event.currentTarget.getBoundingClientRect();

        setDraggedToTime(
          clientXToTime({
            offsetX: event.clientX - bcr.left,
            duration,
            width: bcr.width,
          }),
        );
      }}
      onPointerMoveCapture={event => {
        if (duration == null) return;

        const { clientX, currentTarget, pointerId } = event;

        const bcr = currentTarget.getBoundingClientRect();

        const time = clientXToTime({
          offsetX: clientX - bcr.left,
          duration,
          width: bcr.width,
        });

        if (currentTarget.hasPointerCapture(pointerId)) {
          setDraggedToTime(time);
        }

        setHoverInfo({ x: clientX, time });
      }}
      onPointerOutCapture={() => {
        setHoverInfo(undefined);
      }}
      onPointerUpCapture={releasePoinerCapture}
      onPointerCancelCapture={releasePoinerCapture}
    >
      {duration != null && (
        <>
          {buffered.map((timeRange, index) => (
            <div
              key={index}
              className="pointer-events-none absolute inset-0 h-full w-full origin-left transform bg-muted-foreground/20"
              style={{
                ['--tw-translate-x' as string]: `${(100 * timeRange.start) / duration}%`,
                ['--tw-scale-x' as string]: `${(timeRange.end - timeRange.start) / duration}`,
              }}
            />
          ))}

          <div
            className="pointer-events-none absolute inset-0 h-full w-full origin-left transform bg-primary will-change-transform"
            style={{
              ['--tw-scale-x' as string]:
                (draggedToTime ?? currentTime) / duration,
            }}
          />
        </>
      )}

      <span
        className={clsx(
          'pointer-events-none border-s ps-1 mix-blend-difference transition-colors',
          {
            'border-transparent': !hoverInfo,
            'absolute transform will-change-contents': hoverInfo,
          },
        )}
        style={{
          ['--tw-translate-x' as string]: hoverInfo
            ? `${hoverInfo.x}px`
            : undefined,
        }}
      >
        {formatDuration(draggedToTime ?? hoverInfo?.time ?? currentTime)}
      </span>

      {duration != null && (
        <span className="pointer-events-none ms-auto border-e border-transparent pe-1 mix-blend-difference">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
