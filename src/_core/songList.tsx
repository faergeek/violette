import { Link } from '@tanstack/react-router';
import {
  CirclePause,
  CirclePlay,
  Download,
  EllipsisVertical,
  Info,
  ListEnd,
  ListPlus,
  ListStart,
  Play,
} from 'lucide-react';
import { cloneElement, useLayoutEffect } from 'react';

import type { BaseSong, SubsonicCredentials } from '../api/types';
import { startPlaying, togglePlayback } from '../store/mutations';
import { useStoreMutate, useStoreState } from '../store/react';
import { cn } from './cn';
import { CoverArt } from './coverArt';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdownMenu';
import { formatDuration } from './formatDuration';
import { IconButton } from './iconButton';
import { Skeleton } from './skeleton';
import { StarredIcon } from './starredIcon';
import type { SkeletonProps } from './types';

function getSongElementId(songId: string) {
  return `song-${songId}`;
}

export function SongList({
  credentials,
  isAlbumView,
  isCompilation,
  primaryArtist,
  selectedSongId,
  skeleton,
  songs,
  songsToPlay = songs,
}: SkeletonProps<{
  credentials: SubsonicCredentials;
  isAlbumView?: boolean;
  isCompilation?: boolean;
  primaryArtist?: string;
  selectedSongId?: string;
  songs: BaseSong[];
  songsToPlay?: BaseSong[];
}>) {
  const mutateStore = useStoreMutate();
  const currentSongId = useStoreState(state => state.currentSongId);
  const paused = useStoreState(state => state.paused);

  useLayoutEffect(() => {
    if (!selectedSongId) return;

    const song = songs.find(s => s.id === selectedSongId);
    if (!song) return;

    const el = document.getElementById(getSongElementId(selectedSongId));
    if (!el) return;

    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selectedSongId, songs]);

  return (
    <div>
      {(skeleton ? new Array<null>(5).fill(null) : songs).map((song, index) => {
        const isCurrentInPlayer = song ? song.id === currentSongId : false;

        return (
          <div
            key={song?.id ?? index}
            className={cn(
              'group flex items-center gap-2 border-t p-2 hover:bg-muted/50',
              {
                'bg-red-500 hover:bg-red-500':
                  selectedSongId != null &&
                  song != null &&
                  selectedSongId === song.id,
              },
            )}
            id={song ? getSongElementId(song.id) : undefined}
          >
            <div
              className={cn(
                'relative flex shrink-0 justify-end text-right',
                isAlbumView ? 'basis-6' : 'basis-12',
              )}
            >
              {isAlbumView ? (
                <span
                  className={cn(
                    'slashed-zero tabular-nums text-muted-foreground group-hover:text-transparent',
                    { 'text-transparent': isCurrentInPlayer },
                  )}
                >
                  {song?.track}
                </span>
              ) : credentials && song ? (
                <CoverArt
                  className={cn('size-12 group-hover:opacity-25', {
                    'opacity-25': isCurrentInPlayer,
                  })}
                  coverArt={song.coverArt}
                  credentials={credentials}
                  size={96}
                />
              ) : (
                <CoverArt skeleton />
              )}

              {isCurrentInPlayer && !paused && (
                <span className="absolute inset-0 m-auto flex h-3 w-3 group-hover:invisible">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
              )}

              {songs && song && (
                <button
                  className={cn(
                    'invisible absolute inset-0 m-auto flex items-center justify-center rounded-full group-hover:visible',
                    { visible: isCurrentInPlayer && paused },
                  )}
                  type="button"
                  onClick={() => {
                    if (isCurrentInPlayer) {
                      mutateStore(togglePlayback());
                    } else {
                      mutateStore(startPlaying(song, songsToPlay));
                    }
                  }}
                >
                  {cloneElement(
                    isCurrentInPlayer && !paused ? (
                      <CirclePause />
                    ) : (
                      <CirclePlay />
                    ),
                    { className: 'stroke-primary size-8' },
                  )}
                </button>
              )}
            </div>

            <div className="me-2 min-w-0 grow basis-0">
              {song ? (
                <div>
                  <Link
                    params={{ albumId: song.albumId }}
                    search={{ song: song.id }}
                    to="/album/$albumId"
                  >
                    {song.title}
                  </Link>

                  {isAlbumView &&
                    (isCompilation || primaryArtist !== song.artist) && (
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        &ndash;{' '}
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
                        )}
                      </span>
                    )}
                </div>
              ) : (
                <Skeleton className="max-w-40" />
              )}

              {!isAlbumView &&
                (song ? (
                  <div className="text-muted-foreground">
                    {primaryArtist !== song.artist && (
                      <>
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
                      </>
                    )}
                    <Link
                      params={{ albumId: song.albumId }}
                      to="/album/$albumId"
                    >
                      {song.album}
                    </Link>
                  </div>
                ) : (
                  <Skeleton className="max-w-64" />
                ))}
            </div>

            <div className="relative ms-auto shrink-0 basis-12 items-center text-right slashed-zero tabular-nums text-muted-foreground">
              {song ? (
                formatDuration(song.duration)
              ) : (
                <Skeleton className="inline-block w-full" />
              )}
            </div>

            {song && (
              <div className="ms-2 flex shrink-0 basis-5">
                <IconButton
                  className="rounded-md align-middle"
                  icon={<StarredIcon starred={song.starred} />}
                  onClick={() => {
                    console.log('TODO');
                  }}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="ms-2">
                    <IconButton icon={<EllipsisVertical />} />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('TODO');
                      }}
                    >
                      <Play />
                      Play now
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        console.log('TODO');
                      }}
                    >
                      <ListStart />
                      Play next
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        console.log('TODO');
                      }}
                    >
                      <ListEnd />
                      Play last
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        console.log('TODO');
                      }}
                    >
                      <ListPlus />
                      Add to Playlist&hellip;
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        console.log('TODO');
                      }}
                    >
                      <Info />
                      Info
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        console.log('TODO');
                      }}
                    >
                      <Download />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
