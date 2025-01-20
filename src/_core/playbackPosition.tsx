import { useState } from 'react';

import { StoreConsumer, useAppStore } from '../store/react';
import { formatDuration } from './formatDuration';

function clientXToTime({
  duration,
  offsetX,
  width,
}: {
  duration: number;
  offsetX: number;
  width: number;
}) {
  return Math.max(0, Math.min((duration * offsetX) / width, duration));
}

export function PlaybackPosition() {
  const buffered = useAppStore(state => state.player.buffered);
  const duration = useAppStore(state => state.player.duration);

  const setCurrentTime = useAppStore(state => state.player.setCurrentTime);

  const [draggedToTime, setDraggedToTime] = useState<number>();
  const [hoveredTime, setHoveredTime] = useState<number>();

  function releasePoinerCapture(event: React.PointerEvent<HTMLDivElement>) {
    if (draggedToTime != null) setCurrentTime(draggedToTime);

    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);

    setDraggedToTime(undefined);
  }

  return (
    <div
      aria-label="Playback position"
      className="relative h-5 w-full touch-none select-none overflow-hidden bg-secondary"
      onPointerDownCapture={event => {
        if (duration == null) return;
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

        const bcr = event.currentTarget.getBoundingClientRect();

        const time = clientXToTime({
          offsetX: event.clientX - bcr.left,
          duration,
          width: bcr.width,
        });

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          setDraggedToTime(time);
        } else {
          setHoveredTime(time);
        }
      }}
      onPointerOutCapture={() => {
        setHoveredTime(undefined);
      }}
      onPointerUpCapture={releasePoinerCapture}
      onPointerCancelCapture={releasePoinerCapture}
    >
      {duration != null &&
        buffered.map((timeRange, index) => (
          <div
            key={index}
            className="pointer-events-none absolute h-full w-full origin-left transform bg-muted-foreground/20"
            style={{
              ['--tw-translate-x' as string]: `${(100 * timeRange.start) / duration}%`,
              ['--tw-scale-x' as string]: `${(timeRange.end - timeRange.start) / duration}`,
            }}
          />
        ))}

      {duration != null && (
        <StoreConsumer
          selector={state =>
            (draggedToTime ?? state.player.currentTime) / duration
          }
        >
          {scaleX => (
            <div
              className="pointer-events-none absolute h-full w-full origin-left transform bg-primary will-change-transform"
              style={{ ['--tw-scale-x' as string]: scaleX }}
            />
          )}
        </StoreConsumer>
      )}

      <div className="flex px-1 slashed-zero tabular-nums">
        <StoreConsumer
          selector={state =>
            formatDuration(
              draggedToTime ?? hoveredTime ?? state.player.currentTime,
            )
          }
        >
          {formatted => (
            <time
              aria-label="Position"
              className="pointer-events-none relative text-sm will-change-contents"
            >
              {formatted}
            </time>
          )}
        </StoreConsumer>

        {duration != null && (
          <time
            aria-label="Song duration"
            className="pointer-events-none relative ms-auto text-sm"
          >
            {formatDuration(duration)}
          </time>
        )}
      </div>
    </div>
  );
}
