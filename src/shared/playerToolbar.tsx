import clsx from 'clsx';
import {
  ListMusicIcon,
  PauseIcon,
  PlayIcon,
  Repeat1Icon,
  RepeatIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SlidersVerticalIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as v from 'valibot';

import * as Store__Context from '../store/context';
import { ReplayGainOptions } from '../store/state';
import { goToNextSong } from '../storeFx/goToNextSong';
import { goToPrevSong } from '../storeFx/goToPrevSong';
import { handleMediaSessionAction } from '../storeFx/handleMediaSessionAction.js';
import { useStoreFxRun } from '../storeFx/run.js';
import * as StoreFx__RunAsync from '../storeFx/runAsync.js';
import { setCurrentTime } from '../storeFx/setCurrentTime.js';
import { setReplayGainOptions } from '../storeFx/setReplayGainOptions';
import { setVolume } from '../storeFx/setVolume.js';
import { subscribeToAudioEvents } from '../storeFx/subscribeToAudioEvents.js';
import { toggleMuted } from '../storeFx/toggleMuted';
import * as StoreFx__TogglePaused from '../storeFx/togglePaused.js';
import { Button } from './button.jsx';
import * as Gain from './gain';
import { H2 } from './h2';
import { Label } from './label';
import css from './playerToolbar.module.css';
import * as Popover from './popover';
import { QueueContextConsumer } from './queueContext';
import * as RadioGroup from './radioGroup';
import { Slider } from './slider';

export function PlayerToolbar({
  queueId,
  queueTriggerRef,
}: {
  queueId: string;
  queueTriggerRef: React.Ref<HTMLButtonElement>;
}) {
  const runStoreFx = useStoreFxRun();

  useEffect(() => {
    const result = runStoreFx(subscribeToAudioEvents());
    if (result.TAG !== 0) throw new Error();

    return result._0;
  }, [runStoreFx]);

  const runAsyncStoreFx = StoreFx__RunAsync.use();

  useEffect(() => {
    const abortController = new AbortController();

    addEventListener(
      'keydown',
      event => {
        if (document.activeElement !== document.body) {
          if (
            event.code === 'Escape' &&
            document.activeElement instanceof HTMLElement
          ) {
            document.activeElement.blur();
          }
          return;
        }

        switch (event.code) {
          case 'ArrowDown': {
            event.preventDefault();
            const result = runStoreFx(setVolume(prev => prev - 0.05));
            if (result.TAG !== 0) throw new Error();
            break;
          }
          case 'ArrowUp': {
            event.preventDefault();
            const result = runStoreFx(setVolume(prev => prev + 0.05));
            if (result.TAG !== 0) throw new Error();
            break;
          }
          case 'ArrowLeft':
          case 'KeyJ':
            runAsyncStoreFx(setCurrentTime(prev => prev - 10)).then(result => {
              if (result.TAG !== 0) throw new Error();
            });
            break;
          case 'ArrowRight':
          case 'KeyL':
            runAsyncStoreFx(setCurrentTime(prev => prev + 10)).then(result => {
              if (result.TAG !== 0) throw new Error();
            });
            break;
          case 'KeyK':
          case 'Space':
            event.preventDefault();
            runAsyncStoreFx(StoreFx__TogglePaused.make()).then(result => {
              if (result.TAG !== 0) throw new Error();
            });
            break;
        }
      },
      {
        capture: false,
        passive: false,
        signal: abortController.signal,
      },
    );

    return () => {
      abortController.abort();
    };
  }, [runAsyncStoreFx, runStoreFx]);

  useEffect(() => {
    const actions: MediaSessionAction[] = [
      'nexttrack',
      'pause',
      'play',
      'previoustrack',
      'seekbackward',
      'seekforward',
      'seekto',
      'stop',
    ];

    for (const action of actions) {
      navigator.mediaSession.setActionHandler(action, event => {
        runAsyncStoreFx(handleMediaSessionAction(event)).then(result => {
          if (result.TAG !== 0) throw new Error();
        });
      });
    }

    return () => {
      for (const action of actions) {
        navigator.mediaSession.setActionHandler(action, null);
      }
    };
  }, [runAsyncStoreFx]);

  const [repeatMode, setRepeatMode] = useState<number>();

  const hasCurrentSong = Store__Context.useAppStore(
    state => state.player.currentSongId != null,
  );

  return (
    <div className={css.root}>
      <div className={css.item}>
        <Popover.Root>
          <Popover.Content padding={4} placement="top-end" strategy="fixed">
            <div
              className={css.volumeSettings}
              id="volume-settings"
              popover="auto"
            >
              <H2 id="volume-heading">Volume</H2>

              <div className={css.volumeSettingsContent}>
                <div className={css.volumeSettingsItem}>
                  <Store__Context.Consumer
                    selector={state => state.player.volume}
                  >
                    {volume => (
                      <Slider
                        ariaLabelledby="volume-heading"
                        max={1}
                        step={0.05}
                        value={volume}
                        onValueChange={newVolume => {
                          const result = runStoreFx(setVolume(() => newVolume));
                          if (result.TAG !== 0) throw new Error();
                        }}
                      />
                    )}
                  </Store__Context.Consumer>

                  <Store__Context.Consumer
                    selector={state =>
                      state.player.muted || state.player.volume === 0
                        ? 'muted'
                        : state.player.volume < 0.5
                          ? 'volume1'
                          : 'volume2'
                    }
                  >
                    {state => (
                      <Button
                        aria-label="Mute"
                        aria-pressed={state === 'muted'}
                        variant="icon"
                        onClick={() => {
                          const result = runStoreFx(toggleMuted());
                          if (result.TAG !== 0) throw new Error();
                        }}
                      >
                        {state === 'volume2' ? (
                          <Volume2Icon role="none" />
                        ) : state === 'muted' ? (
                          <VolumeXIcon role="none" />
                        ) : (
                          <Volume1Icon role="none" />
                        )}
                      </Button>
                    )}
                  </Store__Context.Consumer>
                </div>

                <Store__Context.Consumer
                  selector={state =>
                    state.player.replayGainOptions.preferredGain
                  }
                >
                  {preferredGain => (
                    <RadioGroup.Root
                      name="replay-gain"
                      value={preferredGain ?? ''}
                      onValueChange={newPreferredGain => {
                        const result = runStoreFx(
                          setReplayGainOptions(prevOptions =>
                            v.parse(ReplayGainOptions, {
                              preAmp: prevOptions.preAmp,
                              preferredGain: newPreferredGain || undefined,
                            }),
                          ),
                        );
                        if (result.TAG !== 0) throw new Error();
                      }}
                    >
                      <RadioGroup.Label>Normalization</RadioGroup.Label>
                      <RadioGroup.Item label="None" value="" />
                      <RadioGroup.Item label="Album" value="album" />
                      <RadioGroup.Item label="Track" value="track" />
                    </RadioGroup.Root>
                  )}
                </Store__Context.Consumer>

                <div className={css.volumeSettingsItem}>
                  <Label
                    className={css.volumeSettingsPreAmpLabel}
                    htmlFor="pre-amp"
                  >
                    Pre-amp
                  </Label>

                  <Store__Context.Consumer
                    selector={state => state.player.replayGainOptions.preAmp}
                  >
                    {preAmp => (
                      <>
                        <Slider
                          id="pre-amp"
                          markers={[-15, -10, -5, 0, 5, 10, 15].map(value => ({
                            label: Gain.format(value),
                            value,
                          }))}
                          max={15}
                          min={-15}
                          step={0.5}
                          value={preAmp}
                          onValueChange={newPreAmp => {
                            const result = runStoreFx(
                              setReplayGainOptions(prevOptions => ({
                                preAmp: newPreAmp,
                                preferredGain: prevOptions.preferredGain,
                              })),
                            );
                            if (result.TAG !== 0) throw new Error();
                          }}
                        />

                        <span className={css.volumeSettingsPreAmpUnits}>
                          {Gain.format(preAmp)} dB
                        </span>
                      </>
                    )}
                  </Store__Context.Consumer>
                </div>
              </div>
            </div>
          </Popover.Content>

          <Popover.Reference>
            <Button
              aria-label="Volume"
              className={clsx(css.btn, css.volumeSettingsTrigger)}
              popoverTarget="volume-settings"
              variant="icon"
            >
              <SlidersVerticalIcon role="none" />
            </Button>
          </Popover.Reference>
        </Popover.Root>
      </div>

      <Store__Context.Consumer
        selector={state => state.player.queuedSongIds.length}
      >
        {queuedSongCount => (
          <Button
            aria-label="Previous song"
            className={clsx(css.item, css.btn)}
            disabled={queuedSongCount === 0}
            variant="icon"
            onClick={() => {
              runAsyncStoreFx(goToPrevSong()).then(result => {
                if (result.TAG !== 0) throw new Error();
              });
            }}
          >
            <SkipBackIcon role="none" />
          </Button>
        )}
      </Store__Context.Consumer>

      <Store__Context.Consumer selector={state => state.player.paused}>
        {paused => (
          <Button
            aria-label={paused ? 'Play' : 'Pause'}
            className={clsx(css.item, css.btn)}
            disabled={!hasCurrentSong}
            variant="icon"
            onClick={() => {
              runAsyncStoreFx(StoreFx__TogglePaused.make()).then(result => {
                if (result.TAG !== 0) throw new Error();
              });
            }}
          >
            {paused ? <PlayIcon role="none" /> : <PauseIcon role="none" />}
          </Button>
        )}
      </Store__Context.Consumer>

      <Store__Context.Consumer
        selector={state => state.player.queuedSongIds.length}
      >
        {queuedSongCount => (
          <Button
            aria-label="Next song"
            className={clsx(css.item, css.btn)}
            disabled={queuedSongCount === 0}
            variant="icon"
            onClick={() => {
              runAsyncStoreFx(goToNextSong()).then(result => {
                if (result.TAG !== 0) throw new Error();
              });
            }}
          >
            <SkipForwardIcon role="none" />
          </Button>
        )}
      </Store__Context.Consumer>

      <QueueContextConsumer>
        {({ isOpen, setIsOpen }) => (
          <Button
            ref={queueTriggerRef}
            aria-controls={queueId}
            aria-expanded={isOpen}
            aria-label="Now playing queue"
            className={clsx(
              clsx(css.item, css.btn),
              isOpen ? css.queueButtonIsOpen : undefined,
            )}
            variant="icon"
            onClick={() => {
              setIsOpen(prevState => !prevState);
            }}
          >
            <ListMusicIcon role="none" />
          </Button>
        )}
      </QueueContextConsumer>

      <Button
        aria-label={
          repeatMode != null && repeatMode !== 0 ? 'Repeat one' : 'Repeat all'
        }
        aria-pressed={repeatMode != null}
        className={clsx(clsx(css.item, css.btn), {
          [css.repeatEnabled]: repeatMode != null,
        })}
        variant="icon"
        onClick={() => {
          setRepeatMode(param =>
            param != null ? (param === 0 ? 1 : undefined) : 0,
          );
        }}
      >
        {repeatMode != null && repeatMode !== 0 ? (
          <Repeat1Icon role="none" />
        ) : (
          <RepeatIcon role="none" />
        )}
      </Button>
    </div>
  );
}
