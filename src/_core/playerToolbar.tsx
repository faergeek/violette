import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  SlidersVertical,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cloneElement, useEffect, useState } from 'react';
import * as v from 'valibot';

import { getAlbumSongElementId } from '../pages/album';
import { PreferredGain } from '../slices/player';
import type { StoreState } from '../store/create';
import {
  StoreConsumer,
  useRunAsyncStoreFx,
  useRunStoreFx,
} from '../store/react';
import { goToNextSong } from '../storeFx/goToNextSong';
import { goToPrevSong } from '../storeFx/goToPrevSong';
import { handleMediaSessionAction } from '../storeFx/handleMediaSessionAction';
import { setCurrentTime } from '../storeFx/setCurrentTime';
import { setReplayGainOptions } from '../storeFx/setReplayGainOptions';
import { setVolume } from '../storeFx/setVolume';
import { subscribeToAudioEvents } from '../storeFx/subscribeToAudioEvents';
import { toggleMuted } from '../storeFx/toggleMuted';
import { togglePaused } from '../storeFx/togglePaused';
import { Button } from './button';
import { CoverArt } from './coverArt';
import { formatGain } from './formatGain';
import { H2 } from './headings';
import { Label } from './label';
import { Popover, PopoverContent, PopoverReference } from './popover';
import { QueueContextConsumer } from './queueContext';
import { RadioGroup, RadioGroupItem, RadioGroupLabel } from './radio';
import { Slider } from './slider';
import { StarButton } from './starButton';

interface Props {
  queueId: string;
  queueTriggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function PlayerToolbar({ queueId, queueTriggerRef }: Props) {
  const runStoreFx = useRunStoreFx();
  const runAsyncStoreFx = useRunAsyncStoreFx();

  useEffect(
    () => runStoreFx(subscribeToAudioEvents()).assertOk(),
    [runStoreFx],
  );

  useEffect(() => {
    const abortController = new AbortController();

    window.addEventListener(
      'keydown',
      event => {
        if (document.activeElement === document.body) {
          switch (event.code) {
            case 'KeyK':
            case 'Space':
              event.preventDefault();
              runAsyncStoreFx(togglePaused()).then(result => result.assertOk());
              break;
            case 'KeyJ':
            case 'ArrowLeft':
              runAsyncStoreFx(setCurrentTime(prevState => prevState - 10)).then(
                result => result.assertOk(),
              );
              break;
            case 'KeyL':
            case 'ArrowRight':
              runAsyncStoreFx(setCurrentTime(prevState => prevState + 10)).then(
                result => result.assertOk(),
              );
              break;
            case 'ArrowUp':
              event.preventDefault();
              runStoreFx(setVolume(prevState => prevState + 0.05)).assertOk();
              break;
            case 'ArrowDown':
              event.preventDefault();
              runStoreFx(setVolume(prevState => prevState - 0.05)).assertOk();
              break;
          }
        } else {
          if (
            event.code === 'Escape' &&
            (document.activeElement instanceof HTMLElement ||
              document.activeElement instanceof SVGElement)
          ) {
            document.activeElement.blur();
          }
        }
      },
      {
        capture: false,
        passive: false,
        signal: abortController.signal,
      },
    );

    return () => abortController.abort();
  }, [runAsyncStoreFx, runStoreFx]);

  useEffect(() => {
    async function handle(event: MediaSessionActionDetails) {
      const result = await runAsyncStoreFx(handleMediaSessionAction(event));

      return result.assertOk();
    }

    const actions = [
      'play',
      'pause',
      'stop',
      'seekto',
      'seekforward',
      'seekbackward',
      'previoustrack',
      'nexttrack',
    ] satisfies MediaSessionAction[];

    for (const action of actions) {
      navigator.mediaSession.setActionHandler(action, handle);
    }

    return () => {
      for (const action of actions) {
        navigator.mediaSession.setActionHandler(action, null);
      }
    };
  }, [runAsyncStoreFx]);

  const [repeatMode, setRepeatMode] = useState<'repeat-all' | 'repeat-one'>();

  function getCurrentSong({ player, songs }: StoreState) {
    return player.currentSongId
      ? songs.byId.get(player.currentSongId)
      : undefined;
  }

  return (
    <div className="relative flex items-center bg-background">
      <StoreConsumer selector={getCurrentSong}>
        {song => (
          <CoverArt
            className="size-12 shrink-0"
            coverArt={song?.coverArt}
            lazy
            sizes="3em"
          />
        )}
      </StoreConsumer>

      <div className="grid grow grid-rows-2 overflow-hidden px-2 py-1 text-sm">
        <StoreConsumer selector={getCurrentSong}>
          {song =>
            song && (
              <>
                <span className="col-span-full truncate">
                  <Link
                    aria-label="Song"
                    hash={getAlbumSongElementId(song.id)}
                    hashScrollIntoView={{
                      block: 'nearest',
                      behavior: 'instant',
                    }}
                    params={{ albumId: song.albumId }}
                    to="/album/$albumId"
                  >
                    {song.title}
                  </Link>
                </span>

                <span className="truncate text-muted-foreground">
                  {cloneElement(
                    song.artistId ? (
                      <Link
                        params={{ artistId: song.artistId }}
                        to="/artist/$artistId"
                      />
                    ) : (
                      <span />
                    ),
                    { 'aria-label': 'Artist' },
                    song.artist,
                    ' ',
                    <span aria-hidden>&ndash;</span>,
                  )}{' '}
                  <Link
                    aria-label="Album"
                    params={{ albumId: song.albumId }}
                    to="/album/$albumId"
                  >
                    {song.album}
                  </Link>
                </span>
              </>
            )
          }
        </StoreConsumer>
      </div>

      <StoreConsumer selector={getCurrentSong}>
        {song => (
          <StarButton
            className="p-3"
            disabled={!song}
            id={song?.id}
            starred={song?.starred}
          />
        )}
      </StoreConsumer>

      <StoreConsumer selector={state => state.player.queuedSongIds.length}>
        {queuedSongCount => (
          <Button
            aria-label="Previous song"
            className="hidden p-3 sm:block"
            disabled={queuedSongCount === 0}
            variant="icon"
            onClick={async () => {
              const result = await runAsyncStoreFx(goToPrevSong());
              result.assertOk();
            }}
          >
            <SkipBack role="none" />
          </Button>
        )}
      </StoreConsumer>

      <StoreConsumer selector={state => state.player.currentSongId != null}>
        {hasCurrentSong => (
          <StoreConsumer selector={state => state.player.paused}>
            {paused => (
              <Button
                aria-label={paused ? 'Play' : 'Pause'}
                className="p-3"
                disabled={!hasCurrentSong}
                variant="icon"
                onClick={async () => {
                  const result = await runAsyncStoreFx(togglePaused());
                  result.assertOk();
                }}
              >
                {paused ? <Play role="none" /> : <Pause role="none" />}
              </Button>
            )}
          </StoreConsumer>
        )}
      </StoreConsumer>

      <StoreConsumer selector={state => state.player.queuedSongIds.length}>
        {queuedSongCount => (
          <Button
            aria-label="Next song"
            className="hidden p-3 sm:block"
            disabled={queuedSongCount === 0}
            variant="icon"
            onClick={async () => {
              const result = await runAsyncStoreFx(goToNextSong());
              result.assertOk();
            }}
          >
            <SkipForward role="none" />
          </Button>
        )}
      </StoreConsumer>

      <Button
        aria-label={
          repeatMode == null
            ? 'Repeat all'
            : {
                'repeat-all': 'Repeat all',
                'repeat-one': 'Repeat one',
              }[repeatMode]
        }
        aria-pressed={repeatMode == null ? 'false' : 'true'}
        className={clsx('hidden p-3 sm:block', {
          'text-primary enabled:hover:text-primary': repeatMode != null,
        })}
        variant="icon"
        onClick={() => {
          setRepeatMode(prevState => {
            switch (prevState) {
              case undefined:
                return 'repeat-all';
              case 'repeat-all':
                return 'repeat-one';
              case 'repeat-one':
                return undefined;
            }
          });
        }}
      >
        {repeatMode === 'repeat-one' ? (
          <Repeat1 role="none" />
        ) : (
          <Repeat role="none" />
        )}
      </Button>

      <QueueContextConsumer>
        {({ isOpen, setIsOpen }) => (
          <Button
            ref={queueTriggerRef}
            aria-controls={queueId}
            aria-expanded={isOpen}
            aria-label="Now playing queue"
            className={clsx('hidden p-3 sm:block', {
              'text-primary': isOpen,
            })}
            variant="icon"
            onClick={() => {
              setIsOpen(prevState => !prevState);
            }}
          >
            <ListMusic role="none" />
          </Button>
        )}
      </QueueContextConsumer>

      <div className="group/volume-settings hidden sm:block">
        <Popover>
          <PopoverReference>
            <Button
              aria-label="Volume"
              className="p-3 group-has-[#volume-settings:popover-open]/volume-settings:[&:not(:hover)]:text-primary"
              popoverTarget="volume-settings"
              variant="icon"
            >
              <SlidersVertical role="none" />
            </Button>
          </PopoverReference>

          <PopoverContent padding={8} placement="top-end" strategy="fixed">
            <div
              className="m-0 w-96 rounded-md border bg-background p-3 shadow-md [&:popover-open]:animate-in [&:popover-open]:fade-in-0 [&:popover-open]:zoom-in-95 [&:popover-open]:slide-in-from-bottom-2"
              id="volume-settings"
              popover="auto"
            >
              <H2 id="volume-heading">Volume</H2>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <StoreConsumer selector={state => state.player.volume}>
                    {volume => (
                      <Slider
                        aria-labelledby="volume-heading"
                        max={1}
                        step={0.05}
                        value={volume}
                        onValueChange={newVolume => {
                          runStoreFx(setVolume(newVolume)).assertOk();
                        }}
                      />
                    )}
                  </StoreConsumer>

                  <StoreConsumer
                    selector={({ player: audioState }) =>
                      audioState.muted || audioState.volume === 0
                        ? 'muted'
                        : audioState.volume < 0.5
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
                          runStoreFx(toggleMuted()).assertOk();
                        }}
                      >
                        {
                          {
                            muted: <VolumeX role="none" />,
                            volume1: <Volume1 role="none" />,
                            volume2: <Volume2 role="none" />,
                          }[state]
                        }
                      </Button>
                    )}
                  </StoreConsumer>
                </div>

                <StoreConsumer
                  selector={state =>
                    state.player.replayGainOptions.preferredGain
                  }
                >
                  {preferredGain => (
                    <RadioGroup
                      className="[font-variant-caps:all-small-caps]"
                      name="replay-gain"
                      value={preferredGain || ''}
                      onValueChange={newValue => {
                        runStoreFx(
                          setReplayGainOptions(prevOptions => ({
                            ...prevOptions,
                            preferredGain: v.parse(
                              v.optional(v.enum(PreferredGain)),
                              newValue || undefined,
                            ),
                          })),
                        ).assertOk();
                      }}
                    >
                      <RadioGroupLabel className="me-2">
                        Normalization
                      </RadioGroupLabel>

                      <RadioGroupItem label="None" value="" />

                      <RadioGroupItem
                        label="Album"
                        value={PreferredGain.Album}
                      />

                      <RadioGroupItem
                        label="Track"
                        value={PreferredGain.Track}
                      />
                    </RadioGroup>
                  )}
                </StoreConsumer>

                <div className="flex items-center gap-2">
                  <Label
                    className="mt-2 shrink-0 pb-2 [font-variant-caps:all-small-caps]"
                    htmlFor="pre-amp"
                  >
                    Pre-amp
                  </Label>

                  <StoreConsumer
                    selector={state => state.player.replayGainOptions.preAmp}
                  >
                    {preAmp => (
                      <>
                        <Slider
                          id="pre-amp"
                          markers={[-15, -10, -5, 0, 5, 10, 15].map(value => ({
                            label: formatGain(value),
                            value,
                          }))}
                          max={15}
                          min={-15}
                          step={0.5}
                          value={preAmp}
                          onValueChange={newPreAmp => {
                            runStoreFx(
                              setReplayGainOptions(prevOptions => ({
                                ...prevOptions,
                                preAmp: newPreAmp,
                              })),
                            ).assertOk();
                          }}
                        />

                        <span className="shrink-0 font-mono text-xs">
                          {formatGain(preAmp)} dB
                        </span>
                      </>
                    )}
                  </StoreConsumer>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
