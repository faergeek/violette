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
import {
  StoreStateConsumer,
  useStoreMutations,
  useStoreState,
} from '../store/react';
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
import { StarButton } from './starButton';
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
  const mutations = useStoreMutations();
  const currentSongId = useStoreState(state => state.currentSongId);

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
              'group -mt-[1px] flex items-center gap-2 border-y p-2 first:mt-0 hover:bg-muted/50',
              {
                'relative border-primary bg-secondary hover:bg-secondary':
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

              <StoreStateConsumer selector={state => state.audioState.paused}>
                {paused => (
                  <>
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
                            mutations.togglePaused();
                          } else {
                            mutations.startPlaying(song, songsToPlay);
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
                  </>
                )}
              </StoreStateConsumer>
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
                <StarButton id={song.id} starred={song.starred} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="ms-2">
                    <IconButton icon={<EllipsisVertical />} />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO');
                      }}
                    >
                      <Play />
                      Play now
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO');
                      }}
                    >
                      <ListStart />
                      Play next
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO');
                      }}
                    >
                      <ListEnd />
                      Play last
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO');
                      }}
                    >
                      <ListPlus />
                      Add to Playlist&hellip;
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO');
                      }}
                    >
                      <Info />
                      Info
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert('TODO');
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
