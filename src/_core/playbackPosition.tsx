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

  const [hoverInfo, setHoverInfo] = useState<{ x: number; time: number }>();

  function clientXToTime(params: {
    duration: number;
    x: number;
    width: number;
  }) {
    return Math.max(
      0,
      Math.min((params.duration * params.x) / params.width, params.duration),
    );
  }

  return (
    <div
      aria-label="Playback position"
      aria-valuemax={duration ?? 0}
      aria-valuenow={hoverInfo?.time ?? currentTime}
      aria-valuetext={formatDuration(hoverInfo?.time ?? currentTime)}
      className="group/playback-position relative -mt-4 h-4 select-none text-xs slashed-zero tabular-nums text-white transition-colors [@media(hover:hover){&:not(:hover)}]:text-transparent"
      role="slider"
      tabIndex={0}
      onMouseMove={event => {
        if (duration == null) return;

        const bcr = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bcr.left;

        requestAnimationFrame(() => {
          setHoverInfo({
            x,
            time: clientXToTime({ x, duration, width: bcr.width }),
          });
        });
      }}
      onMouseOut={() => {
        requestAnimationFrame(() => {
          setHoverInfo(undefined);
        });
      }}
      onMouseUp={event => {
        if (event.button !== 0 || duration == null) return;

        requestAnimationFrame(() => {
          setHoverInfo(undefined);
        });

        const bcr = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bcr.left;

        runAsyncStoreFx(
          setCurrentTime(
            clientXToTime({
              x,
              duration,
              width: bcr.width,
            }),
          ),
        ).then(result => result.assertOk());
      }}
    >
      <div className="absolute inset-0 top-auto h-4 origin-bottom overflow-hidden bg-secondary transition-transform group-hover/playback-position:scale-y-100 [@media(hover:hover){&}]:scale-y-[0.2]">
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
                ['--tw-scale-x' as string]: currentTime / duration,
              }}
            />
          </>
        )}

        <span
          className={clsx(
            'pointer-events-none absolute left-0 ps-2 mix-blend-difference',
            {
              'border-transparent': !hoverInfo,
              'absolute transform will-change-contents': hoverInfo,
            },
          )}
        >
          {formatDuration(currentTime)}
        </span>

        {duration != null && hoverInfo && (
          <span
            className="pointer-events-none absolute left-0 transform border-s ps-1 mix-blend-difference will-change-contents"
            style={{
              ['--tw-translate-x' as string]: `${hoverInfo.x}px`,
            }}
          >
            {formatDuration(hoverInfo.time)}
          </span>
        )}

        {duration != null && (
          <span className="pointer-events-none absolute right-0 ms-auto pe-2 mix-blend-difference">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    </div>
  );
}
