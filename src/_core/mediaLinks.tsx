import {
  SiLastdotfm,
  SiLastdotfmHex,
  SiMusicbrainz,
  SiMusicbrainzHex,
} from '@icons-pack/react-simple-icons';
import { cloneElement } from 'react';

import { Skeleton } from './skeleton';
import type { SkeletonProps } from './types';

export function MediaLinks({
  lastFmUrl,
  musicBrainzUrl,
  skeleton,
}: SkeletonProps<{
  lastFmUrl?: string;
  musicBrainzUrl?: string;
}>) {
  const links: Array<{
    color: string;
    icon: React.ReactElement<{
      'aria-hidden': boolean;
      className: string;
    }>;
    label: string;
    url: string;
  }> = [
    lastFmUrl && {
      color: SiLastdotfmHex,
      icon: <SiLastdotfm />,
      label: 'Last.fm',
      url: lastFmUrl,
    },
    musicBrainzUrl && {
      color: SiMusicbrainzHex,
      icon: <SiMusicbrainz />,
      label: 'MusicBrainz',
      url: musicBrainzUrl,
    },
  ].filter(v => !!v);

  const wrapper = <nav className="flex flex-wrap gap-4" />;

  return skeleton
    ? cloneElement(
        wrapper,
        {},
        <>
          {new Array<null>(2).fill(null).map((_, i) => (
            <div key={i} className="inline-block space-x-2 whitespace-nowrap">
              <Skeleton className="inline-block size-6 align-middle" />
              <Skeleton className="inline-block w-16 align-middle" />
            </div>
          ))}
        </>,
      )
    : links.length !== 0 &&
        cloneElement(
          wrapper,
          {},
          links.map(link => (
            <a
              key={link.url}
              className="inline-block space-x-2 whitespace-nowrap text-[color:var(--brand-color)]"
              href={link.url}
              rel="noopener"
              style={{ ['--brand-color' as string]: link.color }}
              target="_blank"
            >
              {cloneElement(link.icon, {
                'aria-hidden': true,
                className: 'inline-block',
              })}

              <span className="align-middle">{link.label}</span>
            </a>
          )),
        );
}
