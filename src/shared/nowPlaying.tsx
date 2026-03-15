import { Link, useNavigate } from '@tanstack/react-router';
import { HomeIcon, LogOutIcon, MenuIcon } from 'lucide-react';

import { useAppStore } from '../store/context.jsx';
import { getSongElementId } from './album.js';
import { Button } from './button.jsx';
import { Container } from './container.jsx';
import { CoverArt } from './coverArt.jsx';
import * as DropdownMenu from './dropdownMenu';
import css from './nowPlaying.module.css';
import { Skeleton } from './skeleton';
import { StarButton } from './starButton';

export function NowPlaying() {
  const navigate = useNavigate();

  const clearSubsonicCredentials = useAppStore(
    state => state.auth.clearSubsonicCredentials,
  );

  const currentSongId = useAppStore(state => state.player.currentSongId);

  const song = useAppStore(state =>
    currentSongId == null ? undefined : state.songs.byId.get(currentSongId),
  );

  return (
    <Container className={css.root}>
      <CoverArt
        className={css.coverArt}
        lazy
        sizes="3em"
        coverArt={song?.coverArt}
      />

      <div className={css.info}>
        {song == null ? (
          currentSongId != null ? (
            <Skeleton className={css.skeletonLine1} />
          ) : null
        ) : (
          <span className={css.name}>
            <Link
              aria-label="Song"
              hash={getSongElementId(song.id)}
              hashScrollIntoView={{ behavior: 'instant', block: 'nearest' }}
              params={{ albumId: song.albumId }}
              to="/album/$albumId"
            >
              {song.title}
            </Link>
          </span>
        )}

        {song == null ? (
          currentSongId == null ? null : (
            <Skeleton className={css.skeletonLine2} />
          )
        ) : (
          <span className={css.artistAndAlbum}>
            {song.artistId == null ? (
              <span aria-label="Artist">{song.artist}</span>
            ) : (
              <Link
                aria-label="Artist"
                params={{ artistId: song.artistId }}
                to="/artist/$artistId"
              >
                {song.artist}
              </Link>
            )}
            {' – '}
            <Link
              aria-label="Album"
              params={{ albumId: song.albumId }}
              to="/album/$albumId"
            >
              {song.album}
            </Link>
          </span>
        )}
      </div>

      <StarButton
        className={css.starButton}
        disabled={song == null}
        id={song?.id}
        starred={song?.starred}
      />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button
            aria-label="Menu"
            className={css.dropdownMenuButton}
            variant="icon"
          >
            <MenuIcon role="none" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content placement="bottom-end" strategy="fixed">
          <DropdownMenu.Item
            onClick={() => {
              navigate({ to: '/' });
            }}
          >
            <HomeIcon role="none" />
            Home
          </DropdownMenu.Item>

          <form action={clearSubsonicCredentials}>
            <DropdownMenu.Item type="submit">
              <LogOutIcon role="none" />
              Logout
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Container>
  );
}
