import { Link, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';
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
import { cloneElement, memo, useId } from 'react';

import { StoreConsumer, useAppStore } from '../store/react';
import { Button } from './button';
import { CoverArt } from './coverArt';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuReference,
} from './dropdownMenu';
import { formatDuration } from './formatDuration';
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

export const SongRow = memo(function SongRow({
  elementId,
  isAlbumView,
  isCompilation,
  primaryArtist,
  songId,
  songIdsToPlay,
}: Props) {
  const startPlaying = useAppStore(state => state.player.startPlaying);
  const togglePaused = useAppStore(state => state.player.togglePaused);

  const isSelected = useRouterState({
    select: state => state.location.hash === elementId,
  });

  const menuPopoverId = useId();

  return (
    <li
      aria-label="Song"
      className={clsx(
        'group -mt-[1px] flex items-center gap-2 overflow-clip border-y p-2 first:mt-0',
        {
          'hover:bg-muted/50': !isSelected,
          'relative border-primary bg-secondary hover:bg-secondary': isSelected,
        },
      )}
      id={elementId}
    >
      <div
        className={clsx(
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
                    className={clsx('slashed-zero tabular-nums', {
                      'text-muted-foreground group-hover:text-transparent':
                        !isCurrentInPlayer,
                      'text-transparent': isCurrentInPlayer,
                    })}
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
                    className={clsx('size-12 group-hover:opacity-25', {
                      'opacity-25': isCurrentInPlayer,
                    })}
                    coverArt={song.coverArt}
                    lazy
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
                    <span className="absolute inset-0 m-auto flex h-6 w-6 items-center justify-center overflow-clip group-hover:invisible">
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-primary opacity-75" />
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
                      aria-label={
                        isCurrentInPlayer && !paused ? 'Pause' : 'Play'
                      }
                      className={clsx(
                        'absolute inset-0 m-auto flex items-center justify-center rounded-full',
                        {
                          'invisible group-hover:visible':
                            !isCurrentInPlayer || !paused,
                          visible: isCurrentInPlayer && paused,
                        },
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
                          <CirclePause role="none" />
                        ) : (
                          <CirclePlay role="none" />
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
                    aria-label="Title"
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
                      aria-label="Album"
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
              <span aria-label="Duration">{formatDuration(song.duration)}</span>
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

        <span className="ms-2 flex">
          <DropdownMenu>
            <DropdownMenuReference>
              <Button
                aria-label="Song menu"
                popoverTarget={menuPopoverId}
                variant="icon"
              >
                <EllipsisVertical role="none" />
              </Button>
            </DropdownMenuReference>

            <DropdownMenuContent id={menuPopoverId} placement="bottom-end">
              <DropdownMenuItem
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('TODO');
                }}
              >
                <Play role="none" />
                Play now
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('TODO');
                }}
              >
                <ListStart role="none" />
                Play next
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('TODO');
                }}
              >
                <ListEnd role="none" />
                Play last
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('TODO');
                }}
              >
                <ListPlus role="none" />
                Add to Playlist&hellip;
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('TODO');
                }}
              >
                <Info role="none" />
                Info
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('TODO');
                }}
              >
                <Download role="none" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>
    </li>
  );
});
