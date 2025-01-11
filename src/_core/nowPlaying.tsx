import { Link } from '@tanstack/react-router';
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

import { PreferredGain } from '../slices/player';
import type { StoreState } from '../store/create';
import { StoreConsumer, useAppStore } from '../store/react';
import { cn } from './cn';
import { CoverArt } from './coverArt';
import { IconButton } from './iconButton';
import { Label } from './label';
import { PlaybackPosition } from './playbackPosition';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { RadioGroup, RadioGroupItem } from './radioGroup';
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
              <Link
                className="shrink-0"
                params={{ albumId: song.albumId }}
                search={{ song: song.id }}
                to="/album/$albumId"
              >
                <CoverArt
                  className="size-16 rounded-none"
                  coverArt={song.coverArt}
                  sizes="4em"
                />
              </Link>
            ) : (
              <CoverArt className="size-16 rounded-none" />
            )
          }
        </StoreConsumer>

        <div className="flex h-16 grow items-center gap-4 overflow-hidden py-2">
          <StoreConsumer selector={getCurrentSong}>
            {song =>
              song && (
                <div className="min-w-0">
                  <div className="truncate">{song.title}</div>

                  <div className="truncate text-muted-foreground">
                    <span>{song.artist}</span> &ndash; {song.album}
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
                <IconButton
                  className="hidden p-5 sm:block"
                  disabled={queuedSongCount === 0}
                  icon={<SkipBack />}
                  onClick={goToPrevSong}
                />
              )}
            </StoreConsumer>

            <StoreConsumer
              selector={state => state.player.currentSongId != null}
            >
              {hasCurrentSong => (
                <StoreConsumer selector={state => state.player.paused}>
                  {paused => (
                    <IconButton
                      className="p-5"
                      disabled={!hasCurrentSong}
                      icon={paused ? <Play /> : <Pause />}
                      onClick={() => {
                        togglePaused();
                      }}
                    />
                  )}
                </StoreConsumer>
              )}
            </StoreConsumer>

            <StoreConsumer
              selector={state => state.player.queuedSongIds.length}
            >
              {queuedSongCount => (
                <IconButton
                  className="hidden p-5 sm:block"
                  disabled={queuedSongCount === 0}
                  icon={<SkipForward />}
                  onClick={goToNextSong}
                />
              )}
            </StoreConsumer>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-4 px-4 py-2 md:flex">
        <StoreConsumer selector={state => state.player.queuedSongIds.length}>
          {queuedSongCount => (
            <IconButton
              disabled={queuedSongCount === 0}
              icon={<SkipBack />}
              onClick={goToPrevSong}
            />
          )}
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.currentSongId != null}>
          {hasCurrentSong => (
            <StoreConsumer selector={state => state.player.paused}>
              {paused => (
                <IconButton
                  disabled={!hasCurrentSong}
                  icon={paused ? <Play /> : <Pause />}
                  onClick={() => {
                    togglePaused();
                  }}
                />
              )}
            </StoreConsumer>
          )}
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.queuedSongIds.length}>
          {queuedSongCount => (
            <IconButton
              disabled={queuedSongCount === 0}
              icon={<SkipForward />}
              onClick={goToNextSong}
            />
          )}
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.queuedSongIds.length}>
          {songCount => <IconButton icon={<ListMusic />} label={songCount} />}
        </StoreConsumer>

        <IconButton
          className={cn({
            'text-primary enabled:hover:text-primary': repeatMode != null,
          })}
          icon={repeatMode === 'repeat-one' ? <Repeat1 /> : <Repeat />}
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
        />

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
                className="shrink-0"
                params={{ albumId: song.albumId }}
                search={{ song: song.id }}
                to="/album/$albumId"
              >
                <CoverArt
                  className="size-12"
                  coverArt={song.coverArt}
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
              <div className="min-w-0">
                <div className="truncate">
                  <Link
                    params={{ albumId: song.albumId }}
                    search={{ song: song.id }}
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
                    {},
                    song.artist,
                  )}{' '}
                  &ndash;{' '}
                  <Link params={{ albumId: song.albumId }} to="/album/$albumId">
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
            <IconButton
              className="ms-auto"
              icon={
                {
                  muted: <VolumeX />,
                  volume1: <Volume1 />,
                  volume2: <Volume2 />,
                }[state]
              }
              onClick={toggleMuted}
            />
          )}
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.volume}>
          {volume => (
            <Slider
              className="shrink-0 basis-32"
              max={1}
              step={0.05}
              value={[volume]}
              onValueChange={([newVolume]) => {
                setVolume(newVolume);
              }}
            />
          )}
        </StoreConsumer>

        <Popover>
          <PopoverTrigger asChild>
            <IconButton icon={<SlidersVertical />} />
          </PopoverTrigger>

          <PopoverContent align="end" className="hidden w-80 md:block">
            <h2 className="mb-2 font-bold">ReplayGain</h2>

            <StoreConsumer
              selector={state => state.player.replayGainOptions.preferredGain}
            >
              {preferredGain => (
                <RadioGroup
                  className="mb-4 flex"
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
                  <Label className="flex cursor-pointer items-center space-x-2">
                    <RadioGroupItem id="preferred-gain-none" value="" />
                    <span>None</span>
                  </Label>

                  <Label className="flex cursor-pointer items-center space-x-2">
                    <RadioGroupItem
                      id="preferred-gain-album"
                      value={PreferredGain.Album}
                    />

                    <span>Album</span>
                  </Label>

                  <Label className="flex cursor-pointer items-center space-x-2">
                    <RadioGroupItem
                      id="preferred-gain-track"
                      value={PreferredGain.Track}
                    />

                    <span>Track</span>
                  </Label>
                </RadioGroup>
              )}
            </StoreConsumer>

            <Label className="pb-2">Pre-amplification</Label>

            <StoreConsumer
              selector={state => state.player.replayGainOptions.preAmp}
            >
              {preAmp => (
                <div className="flex flex-col gap-2">
                  <Slider
                    max={15}
                    min={-15}
                    step={0.5}
                    value={[preAmp]}
                    onValueChange={([newPreAmp]) => {
                      setReplayGainSettings(replayGainSettings => ({
                        ...replayGainSettings,
                        preAmp: newPreAmp,
                        preferredGain:
                          replayGainSettings.preferredGain ??
                          PreferredGain.Album,
                      }));
                    }}
                  />

                  <div className="flex justify-between text-sm slashed-zero tabular-nums">
                    <div className="ms-auto">
                      {preAmp > 0 ? '+' : preAmp < 0 ? '-' : undefined}
                      {Math.abs(preAmp).toFixed(1)} dB
                    </div>
                  </div>
                </div>
              )}
            </StoreConsumer>

            <PopoverArrow />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
