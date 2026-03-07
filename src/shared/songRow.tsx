import { Link, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';
import {
  CirclePauseIcon,
  CirclePlayIcon,
  DownloadIcon,
  EllipsisIcon,
  InfoIcon,
  ListEndIcon,
  ListPlusIcon,
  ListStartIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react';

import * as Fx from '../fx/fx';
import { useAppStore } from '../store/context.jsx';
import type { Store } from '../store/types';
import * as RunAsync from '../storeFx/runAsync';
import * as StartPlaying from '../storeFx/startPlaying';
import * as TogglePaused from '../storeFx/togglePaused';
import * as UpdatePlayQueue from '../storeFx/updatePlayQueue';
import { Button } from './button.jsx';
import { CoverArt } from './coverArt.jsx';
import * as DropdownMenu from './dropdownMenu';
import * as Duration from './duration';
import { Skeleton } from './skeleton.jsx';
import css from './songRow.module.css';
import { StarButton } from './starButton.jsx';

export function SongRow({
  elementId,
  isAlbumView,
  isCompilation,
  isQueueView,
  primaryArtist,
  songId,
  songIdsToPlay,
}: {
  elementId?: string;
  isAlbumView: boolean;
  isCompilation: boolean;
  isQueueView: boolean;
  primaryArtist?: string;
  songId?: string;
  songIdsToPlay?: string[];
}) {
  const runAsyncStoreFx = RunAsync.use();

  const isSelected = useRouterState({
    select: state => state.location.hash === elementId,
  });

  const isCurrentInPlayer = useAppStore(
    state => state.player.currentSongId === songId,
  );

  const isNowPlaying = useAppStore(
    state => state.player.currentSongId === songId && !state.player.paused,
  );

  const song = useAppStore(state =>
    songId == null ? undefined : state.songs.byId.get(songId),
  );

  return (
    <div
      aria-label="Song"
      className={clsx(css.root, {
        [css.root_albumView]: isAlbumView,
        [css.root_isCurrentInPlayer]: isCurrentInPlayer,
        [css.root_isNowPlaying]: isNowPlaying,
        [css.root_selected]: isSelected,
      })}
      id={elementId}
    >
      <div className={css.coverArtAndTrackNumberCol}>
        {isAlbumView ? (
          song == null ? (
            <Skeleton style={{ width: '2em' }} />
          ) : (
            <span aria-label="Track Number" className={css.trackNumber}>
              {song.track ?? ' '}
            </span>
          )
        ) : (
          <CoverArt
            className={css.coverArt}
            coverArt={song?.coverArt}
            lazy
            sizes="3em"
          />
        )}

        <div className={css.playButtonWrapper}>
          {songId == null ? null : (
            <button
              aria-label="Play"
              aria-pressed={isNowPlaying ? 'true' : 'false'}
              className={css.playButton}
              type="button"
              onClick={() => {
                runAsyncStoreFx(
                  isNowPlaying
                    ? TogglePaused.make()
                    : StartPlaying.make(songId, songIdsToPlay),
                ).then(result => {
                  if (result.TAG !== 0) throw new Error();
                });
              }}
            >
              {isNowPlaying ? (
                <CirclePauseIcon className={css.playButtonIcon} role="none" />
              ) : (
                <CirclePlayIcon className={css.playButtonIcon} role="none" />
              )}
            </button>
          )}

          {isNowPlaying && <div className={css.nowPlayingIndicator} />}
        </div>
      </div>

      <div className={css.title}>
        {song == null ? (
          <Skeleton style={{ maxWidth: '18rem' }} />
        ) : (
          <>
            <Link
              aria-label="Title"
              hash={elementId}
              params={{ albumId: song.albumId }}
              resetScroll={false}
              to="/album/$albumId"
            >
              {song.title}
            </Link>

            {isAlbumView &&
              (isCompilation || primaryArtist !== song.artist) && (
                <span className={css.subtitle}>
                  {' – '}
                  <Link
                    aria-label="Artist"
                    params={{ artistId: song.artistId }}
                    to="/artist/$artistId"
                  >
                    {song.artist}
                  </Link>
                </span>
              )}
          </>
        )}

        {isAlbumView ? null : song == null ? (
          <Skeleton style={{ maxWidth: '10rem' }} />
        ) : (
          <div className={css.subtitle}>
            {primaryArtist === song.artist ? null : (
              <>
                <Link
                  params={{ artistId: song.artistId }}
                  to="/artist/$artistId"
                >
                  {song.artist}
                </Link>

                <span> – </span>
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
        )}
      </div>

      <StarButton
        className={css.starButton}
        disabled={song == null}
        starred={song?.starred}
        id={song?.id}
      />

      {song == null || songId == null ? (
        <Skeleton style={{ width: '3em' }} />
      ) : (
        <div className={css.durationMenuCol}>
          <span aria-label="Duration" className={css.duration}>
            {Duration.format(song.duration)}
          </span>

          <div className={css.menu}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button aria-label="Menu" variant="icon">
                  <EllipsisIcon role="none" />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content placement="bottom-end">
                <DropdownMenu.Item
                  onClick={() => {
                    if (songId == null) throw new Error();

                    runAsyncStoreFx(
                      Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
                        const state = store.getState();

                        const newSongIds = state.player.queuedSongIds.filter(
                          id => id !== songId,
                        );

                        const current = state.player.currentSongId;

                        const index =
                          current !== undefined
                            ? newSongIds.indexOf(current, undefined)
                            : 0;

                        newSongIds.splice(index, 0, songId);

                        return StartPlaying.make(songId, newSongIds);
                      }),
                    ).then(result => {
                      if (result.TAG !== 0) throw new Error();
                    });
                  }}
                >
                  <PlayIcon role="none" />
                  Play now
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => {
                    if (songId == null) throw new Error();

                    runAsyncStoreFx(
                      Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
                        const state = store.getState();
                        const current = state.player.currentSongId;
                        const queued = state.player.queuedSongIds;

                        if (current != null && songId === current) {
                          const currentIndex =
                            current !== undefined
                              ? queued.indexOf(current, undefined)
                              : 0;

                          const newSongIds = queued.filter(id => id !== songId);
                          newSongIds.splice(currentIndex + 1, 0, songId);

                          return StartPlaying.make(
                            newSongIds[currentIndex],
                            newSongIds,
                          );
                        }

                        const newSongIds = queued.filter(id => id !== songId);

                        newSongIds.splice(
                          (current == null ? 0 : newSongIds.indexOf(current)) +
                            1,
                          0,
                          songId,
                        );

                        return StartPlaying.make(current ?? songId, newSongIds);
                      }),
                    ).then(result => {
                      if (result.TAG !== 0) throw new Error();
                    });
                  }}
                >
                  <ListStartIcon role="none" />
                  Play next
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => {
                    if (songId == null) throw new Error();

                    runAsyncStoreFx(
                      Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
                        const state = store.getState();
                        const current = state.player.currentSongId;
                        const queued = state.player.queuedSongIds;

                        let next: string;
                        if (current != null && songId === current) {
                          const index =
                            (queued.indexOf(current) + 1) % queued.length;

                          next = queued[index];
                        } else {
                          next = current ?? queued[0];
                        }

                        return StartPlaying.make(
                          next,
                          state.player.queuedSongIds
                            .filter(id => id !== songId)
                            .concat([songId]),
                        );
                      }),
                    ).then(result => {
                      if (result.TAG !== 0) throw new Error();
                    });
                  }}
                >
                  <ListEndIcon role="none" />
                  Play last
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert('TODO');
                  }}
                >
                  <ListPlusIcon role="none" />
                  Add to Playlist…
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert('TODO');
                  }}
                >
                  <InfoIcon role="none" />
                  Info
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert('TODO');
                  }}
                >
                  <DownloadIcon role="none" />
                  Download
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      )}

      {isQueueView && (
        <Button
          aria-label="Remove from queue"
          className={css.removeFromQueueButton}
          variant="icon"
          onClick={() => {
            runAsyncStoreFx(
              UpdatePlayQueue.make(state => ({
                current: state.current,
                currentTime: state.currentTime,
                queued: state.queued.filter(id => id !== songId),
              })),
            ).then(result => {
              if (result.TAG !== 0) throw new Error();
            });
          }}
        >
          <Trash2Icon role="none" />
        </Button>
      )}
    </div>
  );
}
