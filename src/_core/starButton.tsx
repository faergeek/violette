import { Heart } from 'lucide-react';
import { useOptimistic } from 'react';

import type { StarParams } from '../api/types';
import { useAppStore } from '../store/react';
import { IconButton } from './iconButton';

type Props = { className?: string } & (
  | {
      albumId?: never;
      artistId?: never;
      disabled: true;
      id?: never;
      starred?: never;
    }
  | (StarParams & {
      disabled?: false;
      starred: string | undefined;
    })
);

export function StarButton({
  className,
  disabled,
  starred: starredProp,
  ...starParams
}: Props) {
  const star = useAppStore(state => state.star);
  const unstar = useAppStore(state => state.unstar);

  const [starred, addOptimistic] = useOptimistic(
    starredProp,
    (_, optimisticValue: string | undefined) => optimisticValue,
  );

  return (
    <form
      action={async formData => {
        if (
          starParams.albumId == null &&
          starParams.artistId == null &&
          starParams.id == null
        ) {
          return;
        }

        const newStarred = formData.get('starred')
          ? new Date().toISOString()
          : undefined;

        addOptimistic(newStarred);

        return newStarred ? star(starParams) : unstar(starParams);
      }}
      className="inline-flex"
    >
      <input
        name="starred"
        type="hidden"
        value={starred ? '' : new Date().toISOString()}
      />

      <IconButton
        className={className}
        disabled={disabled}
        icon={
          <Heart className={starred ? 'fill-primary stroke-primary' : ''} />
        }
        type="submit"
      />
    </form>
  );
}
