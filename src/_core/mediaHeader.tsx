import { CoverArt } from './coverArt';

export const MEDIA_HEADER_COVER_ART_SIZES =
  '(max-width: 639px) 100vw, (max-width: 767px) 192px, (max-width: 1023px) 234.667px, (max-width: 1279px) 236px, (max-width: 1535px) 236.8px, 237.3333px';

export function MediaHeader({
  children,
  coverArt,
  links,
}: {
  children: React.ReactNode;
  coverArt: string | undefined;
  links?: React.ReactNode;
}) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      <div className="space-y-4">
        <CoverArt
          className="w-full"
          coverArt={coverArt}
          sizes={MEDIA_HEADER_COVER_ART_SIZES}
        />

        <div className="px-2 sm:px-0">{links}</div>
      </div>

      <div className="px-2 sm:col-span-2 sm:px-0 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
        {children}
      </div>
    </div>
  );
}
