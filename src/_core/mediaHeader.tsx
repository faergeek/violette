import type { SubsonicCredentials } from '../api/types';
import { CoverArt } from './coverArt';

export function MediaHeader({
  children,
  coverArt,
  credentials,
  links,
}: {
  children: React.ReactNode;
  coverArt: string;
  credentials: SubsonicCredentials;
  links?: React.ReactNode;
}) {
  return (
    <header className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      <div className="space-y-4">
        <CoverArt coverArt={coverArt} credentials={credentials} size={300} />

        {links}
      </div>

      <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
        {children}
      </div>
    </header>
  );
}
