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
import { StoreConsumer, useAppStore } from '../store/react';
import { Button } from './button';
import { CoverArt } from './coverArt';
import { formatGain } from './formatGain';
import { H2 } from './headings';
import { Label } from './label';
import { PlaybackPosition } from './playbackPosition';
import { Popover, PopoverContent, PopoverReference } from './popover';
import { RadioGroup, RadioGroupItem, RadioGroupLabel } from './radio';
import { Slider } from './slider';
import { StarButton } from './starButton';

export function NowPlaying() {
  const goToNextSong = useAppStore(state => state.player.goToNextSong);
  const goToPrevSong = useAppStore(state => state.player.goToPrevSong);
  const setCurrentTime = useAppStore(state => state.player.setCurrentTime);
  const setReplayGainSettings = useAppStore(
    state => state.player.setReplayGainOptions,
  );
  const setVolume = useAppStore(state => state.player.setVolume);
  const toggleMuted = useAppStore(state => state.player.toggleMuted);
  const togglePaused = useAppStore(state => state.player.togglePaused);

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
              togglePaused();
              break;
            case 'KeyJ':
            case 'ArrowLeft':
              setCurrentTime(prevState => prevState - 10);
              break;
            case 'KeyL':
            case 'ArrowRight':
              setCurrentTime(prevState => prevState + 10);
              break;
            case 'ArrowUp':
              event.preventDefault();
              setVolume(prevState => prevState + 0.05);
              break;
            case 'ArrowDown':
              event.preventDefault();
              setVolume(prevState => prevState - 0.05);
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
        capture: true,
        passive: false,
        signal: abortController.signal,
      },
    );

    return () => abortController.abort();
  }, [setCurrentTime, setVolume, togglePaused]);

  const [repeatMode, setRepeatMode] = useState<'repeat-all' | 'repeat-one'>();

  function getCurrentSong({ player, songs }: StoreState) {
    return player.currentSongId
      ? songs.byId.get(player.currentSongId)
      : undefined;
  }

  return (
    <>
      <PlaybackPosition />

      <div className="flex gap-2 md:hidden">
        <StoreConsumer selector={getCurrentSong}>
          {song =>
            song ? (
              <CoverArt
                className="size-16 shrink-0 rounded-none"
                coverArt={song.coverArt}
                lazy
                sizes="4em"
              />
            ) : (
              <CoverArt className="size-16 rounded-none" />
            )
          }
        </StoreConsumer>

        <div className="flex h-16 grow items-center gap-4 overflow-hidden py-2">
          <StoreConsumer selector={getCurrentSong}>
            {song =>
              song && (
                <div aria-label="Song info" className="min-w-0">
                  <div aria-label="Title" className="truncate">
                    {song.title}
                  </div>

                  <div className="truncate text-muted-foreground">
                    <span aria-label="Artist">{song.artist}</span>
                    <span aria-hidden> &ndash; </span>
                    <span aria-label="Album">{song.album}</span>
                  </div>
                </div>
              )
            }
          </StoreConsumer>

          <StoreConsumer selector={getCurrentSong}>
            {song =>
              song ? (
                <StarButton
                  className="hidden p-5 sm:block"
                  id={song.id}
                  starred={song.starred}
                />
              ) : (
                <StarButton className="hidden p-5 sm:block" disabled />
              )
            }
          </StoreConsumer>

          <div className="ms-auto flex">
            <StoreConsumer
              selector={state => state.player.queuedSongIds.length}
            >
              {queuedSongCount => (
                <Button
                  aria-label="Previous song"
                  className="hidden p-5 sm:block"
                  disabled={queuedSongCount === 0}
                  variant="icon"
                  onClick={goToPrevSong}
                >
                  <SkipBack role="none" />
                </Button>
              )}
            </StoreConsumer>

            <StoreConsumer
              selector={state => state.player.currentSongId != null}
            >
              {hasCurrentSong => (
                <StoreConsumer selector={state => state.player.paused}>
                  {paused => (
                    <Button
                      aria-label={paused ? 'Play' : 'Pause'}
                      className="p-5"
                      disabled={!hasCurrentSong}
                      variant="icon"
                      onClick={() => {
                        togglePaused();
                      }}
                    >
                      {paused ? <Play role="none" /> : <Pause role="none" />}
                    </Button>
                  )}
                </StoreConsumer>
              )}
            </StoreConsumer>

            <StoreConsumer
              selector={state => state.player.queuedSongIds.length}
            >
              {queuedSongCount => (
                <Button
                  aria-label="Next song"
                  className="hidden p-5 sm:block"
                  disabled={queuedSongCount === 0}
                  variant="icon"
                  onClick={goToNextSong}
                >
                  <SkipForward role="none" />
                </Button>
              )}
            </StoreConsumer>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-4 px-4 py-2 md:flex">
        <StoreConsumer selector={state => state.player.queuedSongIds.length}>
          {queuedSongCount => (
            <Button
              aria-label="Previous song"
              disabled={queuedSongCount === 0}
              variant="icon"
              onClick={goToPrevSong}
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
                  disabled={!hasCurrentSong}
                  variant="icon"
                  onClick={() => {
                    togglePaused();
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
              disabled={queuedSongCount === 0}
              variant="icon"
              onClick={goToNextSong}
            >
              <SkipForward role="none" />
            </Button>
          )}
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.queuedSongIds.length}>
          {songCount => (
            <Button aria-label="Now playing queue" variant="icon">
              <ListMusic role="none" />
              <span aria-label="Number of songs in a queue">{songCount}</span>
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
          className={clsx({
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

        <StoreConsumer selector={getCurrentSong}>
          {song =>
            song ? (
              <StarButton id={song.id} starred={song.starred} />
            ) : (
              <StarButton disabled />
            )
          }
        </StoreConsumer>

        <StoreConsumer selector={getCurrentSong}>
          {song =>
            song ? (
              <Link
                aria-hidden
                className="shrink-0"
                params={{ albumId: song.albumId }}
                to="/album/$albumId"
              >
                <CoverArt
                  className="size-12"
                  coverArt={song.coverArt}
                  lazy
                  sizes="3em"
                />
              </Link>
            ) : (
              <CoverArt className="size-12" />
            )
          }
        </StoreConsumer>

        <StoreConsumer selector={getCurrentSong}>
          {song =>
            song && (
              <div aria-label="Song info" className="min-w-0">
                <div className="truncate">
                  <Link
                    aria-label="Title"
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
                </div>

                <div className="truncate text-muted-foreground">
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
                  )}

                  <span aria-hidden> &ndash; </span>

                  <Link
                    aria-label="Album"
                    params={{ albumId: song.albumId }}
                    to="/album/$albumId"
                  >
                    {song.album}
                  </Link>
                </div>
              </div>
            )
          }
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
              className="ms-auto"
              variant="icon"
              onClick={toggleMuted}
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

        <div>
          <Label
            className="text-center text-xs [font-variant-caps:all-small-caps]"
            htmlFor="volume"
          >
            Volume
          </Label>

          <StoreConsumer selector={state => state.player.volume}>
            {volume => (
              <Slider
                className="w-32"
                id="volume"
                max={1}
                step={0.05}
                value={volume}
                onValueChange={setVolume}
              />
            )}
          </StoreConsumer>
        </div>

        <Popover>
          <PopoverReference>
            <Button
              aria-label="ReplayGain settings"
              popoverTarget="replay-gain-settings"
              variant="icon"
            >
              <SlidersVertical role="none" />
            </Button>
          </PopoverReference>

          <PopoverContent
            offsetOptions={{ mainAxis: 4 }}
            placement="bottom-end"
            shiftOptions={{ padding: 4 }}
            strategy="fixed"
          >
            <div
              className="m-0 w-96 rounded-md border bg-background p-3 shadow-md [&:not(:popover-open)]:animate-out [&:popover-open]:animate-in [&:popover-open]:fade-in-0 [&:popover-open]:zoom-in-95 [&:popover-open]:slide-in-from-bottom-2"
              id="replay-gain-settings"
              popover="auto"
            >
              <H2 className="mb-4 [font-variant-caps:small-caps]">
                ReplayGain
              </H2>

              <div className="space-y-1">
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
                        setReplayGainSettings(replayGainSettings => ({
                          ...replayGainSettings,
                          preferredGain: v.parse(
                            v.optional(v.enum(PreferredGain)),
                            newValue || undefined,
                          ),
                        }));
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
                            setReplayGainSettings(replayGainSettings => ({
                              ...replayGainSettings,
                              preAmp: newPreAmp,
                              preferredGain:
                                replayGainSettings.preferredGain ??
                                PreferredGain.Album,
                            }));
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
    </>
  );
}
