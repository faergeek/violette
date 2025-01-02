import { useRouter } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import invariant from 'tiny-invariant';

import { subsonicStar, subsonicUnstar } from '../api/subsonic';
import { useStoreState } from '../store/react';
import { IconButton } from './iconButton';

type Props = { className?: string } & (
  | {
      albumId?: never;
      artistId?: never;
      disabled: true;
      id?: never;
      starred?: never;
    }
  | {
      albumId: string;
      artistId?: never;
      disabled?: false;
      id?: never;
      starred: string | undefined;
    }
  | {
      albumId?: never;
      artistId: string;
      disabled?: false;
      id?: never;
      starred: string | undefined;
    }
  | {
      albumId?: never;
      artistId?: never;
      disabled?: false;
      id: string;
      starred: string | undefined;
    }
);

export function StarButton({
  albumId,
  artistId,
  className,
  disabled,
  id,
  starred,
}: Props) {
  const router = useRouter();
  const credentials = useStoreState(state => state.credentials);

  return (
    <IconButton
      className={className}
      disabled={disabled || !credentials}
      icon={<Heart className={starred ? 'fill-primary stroke-primary' : ''} />}
      onClick={async () => {
        invariant(credentials);

        if (starred) {
          await subsonicUnstar({ albumId, artistId, id }).runAsync({
            credentials,
          });
        } else {
          await subsonicStar({ albumId, artistId, id }).runAsync({
            credentials,
          });
        }

        router.invalidate();
      }}
    />
  );
}
