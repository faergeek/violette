import { useState } from 'react';

import { useAppStore } from '../store/context';
import * as StoreFx__RunAsync from '../storeFx/runAsync';
import { setCurrentTime } from '../storeFx/setCurrentTime';
import * as Shared__Duration from './duration';
import css from './playbackPosition.module.css';

export function PlaybackPosition() {
  const buffered = useAppStore(state => state.player.buffered);
  const currentTime = useAppStore(state => state.player.currentTime);
  const duration = useAppStore(state => state.player.duration);

  const runAsyncStoreFx = StoreFx__RunAsync.use();

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    time: number;
  }>();

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

  const now = hoverInfo?.time ?? currentTime;

  return (
    <div
      aria-label="Playback position"
      aria-valuemax={duration ?? 0}
      aria-valuenow={now}
      aria-valuetext={Shared__Duration.format(now)}
      className={css.root}
      role="slider"
      tabIndex={0}
      onMouseMove={event => {
        if (duration == null) return;

        const bcr = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bcr.left;

        requestAnimationFrame(() => {
          setHoverInfo(() => ({
            x,
            time: clientXToTime({
              duration,
              x,
              width: bcr.width,
            }),
          }));
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
        const width = bcr.width;
        const x = event.clientX - bcr.left;

        runAsyncStoreFx(
          setCurrentTime(() => clientXToTime({ duration, x, width })),
        ).then(result => {
          if (result.TAG !== 0) throw new Error();
        });
      }}
    >
      <div className={css.inner}>
        {duration != null && (
          <>
            {buffered.map((item, index) => (
              <div
                key={index}
                className={css.buffered}
                style={{
                  ['--scale-x' as string]: (item.end - item.start) / duration,
                  ['--translate-x' as string]: `${(100 * item.start) / duration}%`,
                }}
              />
            ))}

            <div
              className={css.position}
              style={{ ['--scale-x' as string]: currentTime / duration }}
            />
          </>
        )}

        <span className={css.currentTime}>
          {Shared__Duration.format(currentTime)}
        </span>

        {hoverInfo != null && (
          <span
            className={css.hoverTime}
            style={{ ['--translate-x' as string]: `${hoverInfo.x}px` }}
          >
            {Shared__Duration.format(hoverInfo.time)}
          </span>
        )}

        {duration != null && (
          <span className={css.duration}>
            {Shared__Duration.format(duration)}
          </span>
        )}
      </div>
    </div>
  );
}
