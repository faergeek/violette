import { CoverArt } from './coverArt.jsx';
import css from './mediaHeader.module.css';

export const MEDIA_HEADER_COVER_ART_SIZES =
  '(max-width: 639px) 100vw, (max-width: 767px) 192px, (max-width: 1023px) 234.667px, (max-width: 1279px) 236px, (max-width: 1535px) 236.8px, 237.3333px';

export function MediaHeader({
  children,
  coverArt,
  links,
}: {
  children: React.ReactNode;
  coverArt?: string;
  links: React.ReactNode;
}) {
  return (
    <div className={css.root}>
      <div className={css.leftCol}>
        <CoverArt coverArt={coverArt} sizes={MEDIA_HEADER_COVER_ART_SIZES} />
        <div className={css.links}>{links}</div>
      </div>

      <div className={css.rightCol}>{children}</div>
    </div>
  );
}
