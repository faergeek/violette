import clsx from 'clsx';
import { Heart } from 'lucide-react';
import { useOptimistic } from 'react';

import * as StoreFx__RunAsync from '../storeFx/runAsync';
import * as StoreFx__Star from '../storeFx/star';
import * as StoreFx__Unstar from '../storeFx/unstar';
import { Button } from './button.jsx';
import css from './starButton.module.css';

export function StarButton({
  albumId,
  artistId,
  className,
  disabled,
  id,
  starred: starredProp,
}: {
  albumId?: string;
  artistId?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  starred?: string;
}) {
  const runAsyncStoreFx = StoreFx__RunAsync.use();
  const [starred, setStarredOptimistic] = useOptimistic(starredProp);

  return (
    <form
      className={css.root}
      role="none"
      action={async formData => {
        if (albumId == null && artistId == null && id == null) return;

        const starredInputValue = formData.get('starred');

        setStarredOptimistic(
          starredInputValue ? new Date().toISOString() : undefined,
        );

        const result = await runAsyncStoreFx(
          starredInputValue
            ? StoreFx__Star.make({ albumId, artistId, id })
            : StoreFx__Unstar.make({ albumId, artistId, id }),
        );

        if (result.TAG !== 0) throw new Error('Not ok');
      }}
    >
      <Button
        aria-label="Favorite"
        aria-pressed={starred == null ? 'false' : 'true'}
        className={className}
        disabled={disabled}
        name="starred"
        type="submit"
        value={starred == null ? '1' : ''}
        variant="icon"
      >
        <Heart className={clsx({ [css.filledIcon]: starred })} role="none" />
      </Button>
    </form>
  );
}
