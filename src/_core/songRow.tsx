import { Link, useLocation } from '@tanstack/react-router';
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
import { cloneElement } from 'react';

import { StoreConsumer, useAppStore } from '../store/react';
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

interface Props {
  elementId?: string;
  isAlbumView?: boolean;
  isCompilation?: boolean;
  primaryArtist?: string;
  songId: string | undefined;
  songIdsToPlay?: string[];
}

export function SongRow({
  elementId,
  isAlbumView,
  isCompilation,
  primaryArtist,
  songId,
  songIdsToPlay,
}: Props) {
  const location = useLocation();
  const startPlaying = useAppStore(state => state.player.startPlaying);
  const togglePaused = useAppStore(state => state.player.togglePaused);

  const isSelected = location.hash === elementId;

  return (
    <div
      className={cn(
        'group -mt-[1px] flex items-center gap-2 border-y p-2 first:mt-0 hover:bg-muted/50',
        {
          'relative border-primary bg-secondary hover:bg-secondary': isSelected,
        },
      )}
      id={elementId}
    >
      <div
        className={cn(
          'relative flex shrink-0 justify-end text-right',
          isAlbumView ? 'basis-6' : 'basis-12',
        )}
      >
        <StoreConsumer
          selector={state =>
            songId == null ? null : state.songs.byId.get(songId)
          }
        >
          {song =>
            isAlbumView ? (
              <StoreConsumer
                selector={state => state.player.currentSongId === songId}
              >
                {isCurrentInPlayer => (
                  <span
                    className={cn(
                      'slashed-zero tabular-nums text-muted-foreground group-hover:text-transparent',
                      { 'text-transparent': isCurrentInPlayer },
                    )}
                  >
                    {song?.track ?? '\u00a0'}
                  </span>
                )}
              </StoreConsumer>
            ) : song ? (
              <StoreConsumer
                selector={state => state.player.currentSongId === songId}
              >
                {isCurrentInPlayer => (
                  <CoverArt
                    className={cn('size-12 group-hover:opacity-25', {
                      'opacity-25': isCurrentInPlayer,
                    })}
                    coverArt={song.coverArt}
                    sizes="3em"
                  />
                )}
              </StoreConsumer>
            ) : (
              <CoverArt />
            )
          }
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.paused}>
          {paused => (
            <>
              <StoreConsumer
                selector={state => state.player.currentSongId === songId}
              >
                {isCurrentInPlayer =>
                  isCurrentInPlayer &&
                  !paused && (
                    <span className="absolute inset-0 m-auto flex h-3 w-3 group-hover:invisible">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                    </span>
                  )
                }
              </StoreConsumer>

              {songId && (
                <StoreConsumer
                  selector={state => state.player.currentSongId === songId}
                >
                  {isCurrentInPlayer => (
                    <button
                      className={cn(
                        'invisible absolute inset-0 m-auto flex items-center justify-center rounded-full group-hover:visible',
                        { visible: isCurrentInPlayer && paused },
                      )}
                      type="button"
                      onClick={() => {
                        if (isCurrentInPlayer) {
                          togglePaused();
                        } else {
                          startPlaying(songId, songIdsToPlay);
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
                </StoreConsumer>
              )}
            </>
          )}
        </StoreConsumer>
      </div>

      <div className="me-2 min-w-0 grow basis-0">
        <StoreConsumer
          selector={state =>
            songId == null ? null : state.songs.byId.get(songId)
          }
        >
          {song => (
            <>
              {song ? (
                <div>
                  <Link
                    hash={elementId}
                    hashScrollIntoView={false}
                    params={{ albumId: song.albumId }}
                    resetScroll={false}
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
            </>
          )}
        </StoreConsumer>
      </div>

      <div className="relative ms-auto shrink-0 basis-12 items-center text-right slashed-zero tabular-nums text-muted-foreground">
        <StoreConsumer
          selector={state =>
            songId == null ? null : state.songs.byId.get(songId)
          }
        >
          {song =>
            song ? (
              formatDuration(song.duration)
            ) : (
              <Skeleton className="inline-block w-full" />
            )
          }
        </StoreConsumer>
      </div>

      <div className="ms-2 flex shrink-0 basis-5">
        <StoreConsumer
          selector={state =>
            songId == null ? null : state.songs.byId.get(songId)
          }
        >
          {song =>
            song ? (
              <StarButton id={song.id} starred={song.starred} />
            ) : (
              <StarButton disabled />
            )
          }
        </StoreConsumer>

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
    </div>
  );
}
