import { Link, useNavigate } from '@tanstack/react-router';
import { Home, LogOut, Menu } from 'lucide-react';
import { cloneElement } from 'react';

import { getAlbumSongElementId } from '../pages/album';
import { useAppStore } from '../store/react';
import { Button } from './button';
import { CoverArt } from './coverArt';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdownMenu';
import { Skeleton } from './skeleton';
import { StarButton } from './starButton';

export function NowPlaying() {
  const navigate = useNavigate();

  const clearSubsonicCredentials = useAppStore(
    state => state.auth.clearSubsonicCredentials,
  );

  const currentSongId = useAppStore(state => state.player.currentSongId);

  const song = useAppStore(state =>
    currentSongId == null ? null : state.songs.byId.get(currentSongId),
  );

  return (
    <div className="container mx-auto flex items-center sm:px-4">
      <CoverArt
        className="size-12 shrink-0"
        coverArt={song?.coverArt}
        lazy
        sizes="3em"
      />

      <div className="grid grow grid-rows-2 overflow-hidden px-2 py-1 text-sm">
        {song ? (
          <span className="col-span-full truncate">
            <Link
              aria-label="Song"
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
          </span>
        ) : (
          currentSongId != null && <Skeleton className="mt-0 w-20" />
        )}

        {song ? (
          <span className="truncate text-muted-foreground">
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
              ' ',
              <span aria-hidden>&ndash;</span>,
            )}{' '}
            <Link
              aria-label="Album"
              params={{ albumId: song.albumId }}
              to="/album/$albumId"
            >
              {song.album}
            </Link>
          </span>
        ) : (
          currentSongId != null && <Skeleton className="mb-0 w-32" />
        )}
      </div>

      <StarButton
        className="p-3"
        disabled={!song}
        id={song?.id}
        starred={song?.starred}
      />

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button aria-label="Menu" className="p-3" variant="icon">
            <Menu />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent placement="bottom-end" strategy="fixed">
          <DropdownMenuItem
            onClick={() => {
              navigate({ to: '/' });
            }}
          >
            <Home role="none" />
            Home
          </DropdownMenuItem>

          <form
            className="ms-auto"
            onSubmit={event => {
              event.preventDefault();
              clearSubsonicCredentials();
            }}
          >
            <DropdownMenuItem type="submit">
              <LogOut role="none" />
              Logout
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
