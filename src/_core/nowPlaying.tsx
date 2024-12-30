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

import { subsonicGetCoverArtUrl } from '../api/subsonic';
import type { SubsonicCredentials } from '../api/types';
import {
  goToNextSong,
  goToPrevSong,
  setPaused,
  togglePlayback,
} from '../store/mutations';
import { useStoreMutate, useStoreState } from '../store/react';
import { cn } from './cn';
import { CoverArt } from './coverArt';
import { IconButton } from './iconButton';
import { PlaybackPosition } from './playbackPosition';
import { Slider } from './slider';
import { StarredIcon } from './starredIcon';

export function NowPlaying({
  credentials,
}: {
  credentials: SubsonicCredentials;
}) {
  const mutateStore = useStoreMutate();
  const audio = useStoreState(state => state.audio);
  const currentSongId = useStoreState(state => state.currentSongId);
  const paused = useStoreState(state => state.paused);
  const queuedSongs = useStoreState(state => state.queuedSongs);

  const song = queuedSongs.find(s => s.id === currentSongId);

  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  useEffect(() => {
    const abortController = new AbortController();

    const listenerOptions = {
      capture: true,
      passive: true,
      signal: abortController.signal,
    };

    audio.addEventListener(
      'pause',
      () => mutateStore(setPaused(true)),
      listenerOptions,
    );

    audio.addEventListener(
      'play',
      () => mutateStore(setPaused(false)),
      listenerOptions,
    );

    audio.addEventListener(
      'volumechange',
      () => {
        setMuted(audio.muted);
        setVolume(audio.volume);
      },
      listenerOptions,
    );

    return () => abortController.abort();
  }, [audio, mutateStore]);

  useEffect(() => {
    const abortController = new AbortController();

    window.addEventListener(
      'keydown',
      event => {
        switch (event.code) {
          case 'KeyK':
          case 'Space':
            event.preventDefault();
            if (audio.paused) audio.play();
            else audio.pause();
            break;
          case 'KeyJ':
          case 'ArrowLeft':
            audio.currentTime -= 10;
            break;
          case 'KeyL':
          case 'ArrowRight':
            audio.currentTime += 10;
            break;
          case 'ArrowUp':
            event.preventDefault();
            audio.volume = Math.min(audio.volume + 0.05, 1);
            break;
          case 'ArrowDown':
            event.preventDefault();
            audio.volume = Math.max(0, audio.volume - 0.05);
            break;
        }
      },
      {
        capture: true,
        passive: false,
        signal: abortController.signal,
      },
    );

    return () => abortController.abort();
  }, [audio]);

  useEffect(() => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song?.title,
      artist: song?.artist,
      album: song?.album,
      artwork: song?.coverArt
        ? [
            {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt, {
                size: 96,
              }),
              sizes: '96x96',
            },
            {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt, {
                size: 128,
              }),
              sizes: '128x128',
            },
            {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt, {
                size: 192,
              }),
              sizes: '192x192',
            },
            {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt, {
                size: 256,
              }),
              sizes: '256x256',
            },
            {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt, {
                size: 384,
              }),
              sizes: '384x384',
            },
            {
              src: subsonicGetCoverArtUrl(credentials, song.coverArt),
            },
          ]
        : undefined,
    });
  }, [credentials, song?.album, song?.artist, song?.coverArt, song?.title]);

  useEffect(() => {
    const abortController = new AbortController();

    audio.addEventListener('ended', () => mutateStore(goToNextSong()), {
      capture: true,
      passive: true,
      signal: abortController.signal,
    });

    return () => abortController.abort();
  }, [audio, mutateStore]);

  useEffect(() => {
    navigator.mediaSession.setActionHandler('play', () => {
      audio.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      audio.pause();
      audio.currentTime = 0;
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      mutateStore(goToPrevSong());
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      mutateStore(goToNextSong());
    });
  }, [audio, mutateStore]);

  const [repeatMode, setRepeatMode] = useState<'repeat-all' | 'repeat-one'>();

  return (
    <>
      <PlaybackPosition />

      <div className="flex gap-2 md:hidden">
        {credentials && song && (
          <Link
            className="shrink-0"
            params={{ albumId: song.albumId }}
            search={{ song: song.id }}
            to="/album/$albumId"
          >
            <CoverArt
              className="size-16 rounded-none group-hover:opacity-25"
              coverArt={song.coverArt}
              credentials={credentials}
              size={128}
            />
          </Link>
        )}

        <div className="flex h-16 grow items-center gap-4 overflow-hidden py-2">
          <div className="line-clamp-2 grow">{song?.title}</div>

          <IconButton
            className="ms-auto p-5"
            icon={paused ? <Play /> : <Pause />}
            onClick={() => {
              mutateStore(togglePlayback());
            }}
          />
        </div>
      </div>

      <div className="hidden items-center gap-4 px-4 py-2 md:flex">
        <IconButton
          icon={<SkipBack />}
          onClick={() => {
            mutateStore(goToPrevSong());
          }}
        />

        <IconButton
          icon={paused ? <Play /> : <Pause />}
          onClick={() => {
            mutateStore(togglePlayback());
          }}
        />

        <IconButton
          icon={<SkipForward />}
          onClick={() => {
            mutateStore(goToNextSong());
          }}
        />

        <IconButton icon={<ListMusic />} label={queuedSongs.length} />

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

        <IconButton
          icon={<StarredIcon starred={song?.starred} />}
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        />

        {credentials && song && (
          <Link
            className="shrink-0"
            params={{ albumId: song.albumId }}
            search={{ song: song.id }}
            to="/album/$albumId"
          >
            <CoverArt
              className="size-12 group-hover:opacity-25"
              coverArt={song.coverArt}
              credentials={credentials}
              size={96}
            />
          </Link>
        )}

        {song && (
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
        )}

        <IconButton
          className="ms-auto"
          icon={
            muted || volume === 0 ? (
              <VolumeX />
            ) : volume > 0.5 ? (
              <Volume2 />
            ) : (
              <Volume1 />
            )
          }
          onClick={() => {
            if (audio.muted) {
              audio.muted = false;
              if (audio.volume === 0) audio.volume = 0.5;
            } else {
              audio.muted = true;
            }
          }}
        />

        <Slider
          className="shrink-0 basis-32"
          max={1}
          step={0.05}
          value={[volume]}
          onValueChange={([newVolume]) => {
            audio.muted = false;
            audio.volume = newVolume;
          }}
        />
      </div>
    </>
  );
}
