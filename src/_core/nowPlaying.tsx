import { Link } from '@tanstack/react-router';
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cloneElement, useEffect, useState } from 'react';

import {
  StoreStateConsumer,
  useStoreMutations,
  useStoreState,
} from '../store/react';
import { cn } from './cn';
import { CoverArt } from './coverArt';
import { IconButton } from './iconButton';
import { PlaybackPosition } from './playbackPosition';
import { Slider } from './slider';
import { StarButton } from './starButton';

export function NowPlaying() {
  const mutations = useStoreMutations();
  const credentials = useStoreState(state => state.credentials);

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
              mutations.togglePaused();
              break;
            case 'KeyJ':
            case 'ArrowLeft':
              mutations.setAudioCurrentTime(prevState => prevState - 10);
              break;
            case 'KeyL':
            case 'ArrowRight':
              mutations.setAudioCurrentTime(prevState => prevState + 10);
              break;
            case 'ArrowUp':
              event.preventDefault();
              mutations.setVolume(prevState => prevState + 0.05);
              break;
            case 'ArrowDown':
              event.preventDefault();
              mutations.setVolume(prevState => prevState - 0.05);
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
  }, [mutations]);

  const [repeatMode, setRepeatMode] = useState<'repeat-all' | 'repeat-one'>();

  return (
    <>
      <PlaybackPosition />

      <div className="flex gap-2 md:hidden">
        <StoreStateConsumer
          selector={state =>
            state.queuedSongs.find(s => s.id === state.currentSongId)
          }
        >
          {song =>
            credentials && song ? (
              <Link
                className="shrink-0"
                params={{ albumId: song.albumId }}
                search={{ song: song.id }}
                to="/album/$albumId"
              >
                <CoverArt
                  className="size-16 rounded-none"
                  coverArt={song.coverArt}
                  credentials={credentials}
                  size={128}
                />
              </Link>
            ) : (
              <CoverArt skeleton />
            )
          }
        </StoreStateConsumer>

        <div className="flex h-16 grow items-center gap-4 overflow-hidden py-2">
          <StoreStateConsumer
            selector={state =>
              state.queuedSongs.find(s => s.id === state.currentSongId)
            }
          >
            {song => <div className="line-clamp-2 grow">{song?.title}</div>}
          </StoreStateConsumer>

          <StoreStateConsumer selector={state => state.audioState.paused}>
            {paused => (
              <IconButton
                className="ms-auto p-5"
                icon={paused ? <Play /> : <Pause />}
                onClick={() => {
                  mutations.togglePaused();
                }}
              />
            )}
          </StoreStateConsumer>
        </div>
      </div>

      <div className="hidden items-center gap-4 px-4 py-2 md:flex">
        <IconButton
          icon={<SkipBack />}
          onClick={() => {
            mutations.goToPrevSong();
          }}
        />

        <StoreStateConsumer selector={state => state.audioState.paused}>
          {paused => (
            <IconButton
              icon={paused ? <Play /> : <Pause />}
              onClick={() => {
                mutations.togglePaused();
              }}
            />
          )}
        </StoreStateConsumer>

        <IconButton
          icon={<SkipForward />}
          onClick={() => {
            mutations.goToNextSong();
          }}
        />

        <StoreStateConsumer selector={state => state.queuedSongs.length}>
          {songCount => <IconButton icon={<ListMusic />} label={songCount} />}
        </StoreStateConsumer>

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

        <StoreStateConsumer
          selector={state =>
            state.queuedSongs.find(s => s.id === state.currentSongId)
          }
        >
          {song =>
            song ? (
              <StarButton id={song.id} starred={song.starred} />
            ) : (
              <StarButton disabled />
            )
          }
        </StoreStateConsumer>

        <StoreStateConsumer
          selector={state =>
            state.queuedSongs.find(s => s.id === state.currentSongId)
          }
        >
          {song =>
            credentials && song ? (
              <Link
                className="shrink-0"
                params={{ albumId: song.albumId }}
                search={{ song: song.id }}
                to="/album/$albumId"
              >
                <CoverArt
                  className="size-12"
                  coverArt={song.coverArt}
                  credentials={credentials}
                  size={96}
                />
              </Link>
            ) : (
              <CoverArt className="size-12" skeleton />
            )
          }
        </StoreStateConsumer>

        <StoreStateConsumer
          selector={state =>
            state.queuedSongs.find(s => s.id === state.currentSongId)
          }
        >
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
        </StoreStateConsumer>

        <StoreStateConsumer
          selector={({ audioState }) =>
            audioState.muted
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
              onClick={() => mutations.toggleMuted()}
            />
          )}
        </StoreStateConsumer>

        <StoreStateConsumer selector={state => state.audioState.volume}>
          {volume => (
            <Slider
              className="shrink-0 basis-32"
              max={1}
              step={0.05}
              value={[volume]}
              onValueChange={([newVolume]) => {
                mutations.setVolume(newVolume);
              }}
            />
          )}
        </StoreStateConsumer>
      </div>
    </>
  );
}
