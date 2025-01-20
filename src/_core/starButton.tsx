import { Heart } from 'lucide-react';
import { useOptimistic } from 'react';

import type { StarParams } from '../api/subsonic/types/starParams';
import { useRunStoreFx } from '../store/react';
import { star } from '../storeFx/star';
import { unstar } from '../storeFx/unstar';
import { Button } from './button';

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
  const runStoreFx = useRunStoreFx();

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

        const result = newStarred
          ? await runStoreFx(star(starParams))
          : await runStoreFx(unstar(starParams));

        result.assertOk();
      }}
      className="inline-flex"
      role="none"
    >
      <input
        name="starred"
        type="hidden"
        value={starred ? '' : new Date().toISOString()}
      />

      <Button
        aria-label="Star"
        aria-pressed={starred != null}
        className={className}
        disabled={disabled}
        type="submit"
        variant="icon"
      >
        <Heart
          className={starred ? 'fill-primary stroke-primary' : ''}
          role="none"
        />
      </Button>

      {starred != null && (
        <time aria-label="Starred" className="sr-only" dateTime={starred}>
          {new Date(starred).toLocaleString()}
        </time>
      )}
    </form>
  );
}
