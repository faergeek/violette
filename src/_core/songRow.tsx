import { invariant, Link, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';
import {
  CirclePause,
  CirclePlay,
  Download,
  Ellipsis,
  Info,
  ListEnd,
  ListPlus,
  ListStart,
  Play,
  Trash2,
} from 'lucide-react';
import { cloneElement, memo } from 'react';

import { StoreConsumer, useRunAsyncStoreFx } from '../store/react';
import { startPlaying } from '../storeFx/startPlaying';
import { togglePaused } from '../storeFx/togglePaused';
import { updatePlayQueue } from '../storeFx/updatePlayQueue';
import { Button } from './button';
import { CoverArt } from './coverArt';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdownMenu';
import { formatDuration } from './formatDuration';
import { Skeleton } from './skeleton';
import { StarButton } from './starButton';

interface Props {
  elementId?: string;
  isAlbumView?: boolean;
  isCompilation?: boolean;
  isQueueView?: boolean;
  primaryArtist?: string;
  songId: string | undefined;
  songIdsToPlay?: string[];
}

export const SongRow = memo(function SongRow({
  elementId,
  isAlbumView,
  isCompilation,
  isQueueView,
  primaryArtist,
  songId,
  songIdsToPlay,
}: Props) {
  const runAsyncStoreFx = useRunAsyncStoreFx();

  const isSelected = useRouterState({
    select: state => state.location.hash === elementId,
  });

  return (
    <div
      aria-label="Song"
      className={clsx(
        'group/song-row col-span-full grid grid-cols-subgrid items-center border-2 even:bg-muted/50',
        {
          'px-1': isAlbumView,
          'py-1': !isAlbumView,
          'border-transparent': !isSelected,
          'rounded-md border-primary': isSelected,
        },
      )}
      id={elementId}
    >
      <div className="relative grid h-full grid-cols-subgrid items-center justify-items-end overflow-clip">
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
                    aria-hidden
                    className={clsx(
                      'min-w-6 px-1 text-right slashed-zero tabular-nums',
                      {
                        'text-muted-foreground focus-visible:text-transparent group-hover/song-row:text-transparent group-has-[:focus-visible]/song-row:text-transparent':
                          !isCurrentInPlayer,
                        'text-transparent': isCurrentInPlayer,
                      },
                    )}
                  >
                    {song?.track ?? '\u00a0'}
                  </span>
                )}
              </StoreConsumer>
            ) : (
              <StoreConsumer
                selector={state => state.player.currentSongId === songId}
              >
                {isCurrentInPlayer => (
                  <CoverArt
                    className={clsx(
                      'size-12 focus-visible:opacity-25 group-hover/song-row:opacity-25 group-has-[:focus-visible]/song-row:opacity-25',
                      { 'opacity-25': isCurrentInPlayer },
                    )}
                    coverArt={song?.coverArt}
                    lazy
                    sizes="3em"
                  />
                )}
              </StoreConsumer>
            )
          }
        </StoreConsumer>

        <StoreConsumer selector={state => state.player.paused}>
          {paused => (
            <div
              className={clsx('absolute', {
                'right-0': isAlbumView,
                'inset-0 m-auto flex items-center justify-center': !isAlbumView,
              })}
            >
              {songId && (
                <StoreConsumer
                  selector={state => state.player.currentSongId === songId}
                >
                  {isCurrentInPlayer => (
                    <button
                      aria-label="Play"
                      aria-pressed={isCurrentInPlayer && !paused}
                      className={clsx('flex rounded-full outline-offset-2', {
                        'opacity-0 group-hover/song-row:inset-0 group-hover/song-row:opacity-100 group-has-[:focus-visible]/song-row:inset-0 group-has-[:focus-visible]/song-row:opacity-100':
                          !isCurrentInPlayer || !paused,
                        'inset-0 opacity-100': isCurrentInPlayer && paused,
                        'right-0 size-6':
                          isAlbumView && isCurrentInPlayer && !paused,
                        'size-8': !isAlbumView,
                      })}
                      type="button"
                      onClick={async () => {
                        const result = await runAsyncStoreFx(
                          isCurrentInPlayer
                            ? togglePaused()
                            : startPlaying({
                                current: songId,
                                queued: songIdsToPlay,
                              }),
                        );

                        result.assertOk();
                      }}
                    >
                      {cloneElement(
                        isCurrentInPlayer && !paused ? (
                          <CirclePause role="none" />
                        ) : (
                          <CirclePlay role="none" />
                        ),
                        {
                          className: 'stroke-primary size-full max-w-8 max-h-8',
                        },
                      )}
                    </button>
                  )}
                </StoreConsumer>
              )}

              <StoreConsumer
                selector={state => state.player.currentSongId === songId}
              >
                {isCurrentInPlayer =>
                  isCurrentInPlayer &&
                  !paused && (
                    <div
                      className={clsx(
                        'absolute flex h-3 w-3 items-center justify-center group-hover/song-row:invisible group-has-[:focus-visible]/song-row:invisible',
                        {
                          'inset-y-0 right-1 my-auto': isAlbumView,
                          'inset-0 m-auto': !isAlbumView,
                        },
                      )}
                    >
                      <div className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                      <div className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-primary opacity-75" />
                    </div>
                  )
                }
              </StoreConsumer>
            </div>
          )}
        </StoreConsumer>
      </div>

      <div>
        <StoreConsumer
          selector={state =>
            songId == null ? null : state.songs.byId.get(songId)
          }
        >
          {song => (
            <>
              {song ? (
                <>
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
                      <span className="text-muted-foreground">
                        <span aria-hidden> &ndash; </span>
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
                      </span>
                    )}
                </>
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
                        )}
                        <span aria-hidden> &ndash; </span>
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

      <StoreConsumer
        selector={state =>
          songId == null ? null : state.songs.byId.get(songId)
        }
      >
        {song => (
          <StarButton
            className={clsx({
              'p-2': isAlbumView,
              'p-3': !isAlbumView,
            })}
            disabled={!song}
            id={song?.id}
            starred={song?.starred}
          />
        )}
      </StoreConsumer>

      <div className="group/song-row-menu relative grid h-full grid-cols-subgrid items-center justify-items-end">
        <StoreConsumer
          selector={state =>
            songId == null ? null : state.songs.byId.get(songId)
          }
        >
          {song => (
            <span
              aria-label="Duration"
              className={clsx(
                'whitespace-nowrap slashed-zero tabular-nums group-hover/song-row:opacity-0 group-has-[:focus-visible]/song-row:opacity-0',
                {
                  'pe-2': isAlbumView,
                  'pe-3': !isAlbumView,
                },
              )}
            >
              {song ? (
                formatDuration(song.duration)
              ) : (
                <Skeleton className="inline-block w-full" />
              )}
            </span>
          )}
        </StoreConsumer>

        <div className="absolute inset-y-0 right-0 m-auto flex justify-end opacity-0 group-hover/song-row:opacity-100 group-has-[:focus-visible]/song-row:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                aria-label="Song menu"
                className={clsx({
                  'p-2': isAlbumView,
                  'p-3': !isAlbumView,
                })}
                variant="icon"
              >
                <Ellipsis role="none" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent placement="bottom-end">
              <DropdownMenuItem
                onClick={async () => {
                  invariant(songId != null);

                  const result = await runAsyncStoreFx(
                    startPlaying(({ current, queued }) => {
                      if (songId === current) {
                        return { current, queued };
                      }

                      const newSongIds = queued.filter(id => id !== songId);

                      const index =
                        current == null ? 0 : newSongIds.indexOf(current);

                      newSongIds.splice(index, 0, songId);

                      return {
                        current: songId,
                        queued: newSongIds,
                      };
                    }),
                  );

                  result.assertOk();
                }}
              >
                <Play role="none" />
                Play now
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  invariant(songId != null);

                  const result = await runAsyncStoreFx(
                    startPlaying(prevState => {
                      if (songId === prevState.current) {
                        const currentIndex =
                          prevState.current == null
                            ? 0
                            : prevState.queued.indexOf(prevState.current);

                        const newSongIds = prevState.queued.filter(
                          id => id !== songId,
                        );

                        newSongIds.splice(currentIndex + 1, 0, songId);

                        return {
                          current: newSongIds[currentIndex],
                          queued: newSongIds,
                        };
                      }

                      const newSongIds = prevState.queued.filter(
                        id => id !== songId,
                      );

                      newSongIds.splice(
                        (prevState.current == null
                          ? 0
                          : newSongIds.indexOf(prevState.current)) + 1,
                        0,
                        songId,
                      );

                      return {
                        current: prevState.current ?? songId,
                        queued: newSongIds,
                      };
                    }),
                  );

                  result.assertOk();
                }}
              >
                <ListStart role="none" />
                Play next
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  invariant(songId != null);

                  const result = await runAsyncStoreFx(
                    startPlaying(prevState => {
                      const queued = prevState.queued
                        .filter(id => id !== songId)
                        .concat(songId);

                      return {
                        current:
                          songId === prevState.current
                            ? prevState.queued[
                                (prevState.queued.indexOf(prevState.current) +
                                  1) %
                                  prevState.queued.length
                              ]
                            : (prevState.current ?? queued[0]),
                        queued,
                      };
                    }),
                  );

                  result.assertOk();
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
        </div>
      </div>

      {isQueueView && (
        <Button
          aria-label="Remove from queue"
          className={clsx({
            'p-2': isAlbumView,
            'p-3': !isAlbumView,
          })}
          variant="icon"
          onClick={async () => {
            const result = await runAsyncStoreFx(
              updatePlayQueue(({ queued }) => ({
                queued: queued.filter(id => id !== songId),
              })),
            );

            result.assertOk();
          }}
        >
          <Trash2 role="none" />
        </Button>
      )}
    </div>
  );
});
