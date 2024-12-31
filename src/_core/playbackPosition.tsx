import { useState } from 'react';

import {
  StoreStateConsumer,
  useStoreMutations,
  useStoreState,
} from '../store/react';
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
  const mutations = useStoreMutations();
  const buffered = useStoreState(state => state.audioState.buffered);
  const duration = useStoreState(state => state.audioState.duration);

  const [draggedToTime, setDraggedToTime] = useState<number>();
  const [hoveredTime, setHoveredTime] = useState<number>();

  function releasePoinerCapture(event: React.PointerEvent<HTMLDivElement>) {
    if (draggedToTime != null) mutations.setAudioCurrentTime(draggedToTime);

    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);

    setDraggedToTime(undefined);
  }

  return (
    <div
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
        <StoreStateConsumer
          selector={state =>
            (draggedToTime ?? state.audioState.currentTime) / duration
          }
        >
          {scaleX => (
            <div
              className="pointer-events-none absolute h-full w-full origin-left transform-gpu bg-primary will-change-transform"
              style={{ ['--tw-scale-x' as string]: scaleX }}
            />
          )}
        </StoreStateConsumer>
      )}

      <div className="flex px-1 slashed-zero tabular-nums">
        <StoreStateConsumer
          selector={state =>
            formatDuration(
              draggedToTime ?? hoveredTime ?? state.audioState.currentTime,
            )
          }
        >
          {formatted => (
            <div className="pointer-events-none relative transform-gpu text-sm will-change-contents">
              {formatted}
            </div>
          )}
        </StoreStateConsumer>

        {duration != null && (
          <div className="pointer-events-none relative ms-auto transform-gpu text-sm">
            {formatDuration(duration)}
          </div>
        )}
      </div>
    </div>
  );
}
