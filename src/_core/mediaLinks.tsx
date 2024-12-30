import { Brain, Radio } from 'lucide-react';
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
    icon: React.ReactElement<{
      'aria-hidden': boolean;
      className: string;
    }>;
    label: string;
    url: string;
  }> = [
    lastFmUrl && {
      icon: <Radio />,
      label: 'Last.fm',
      url: lastFmUrl,
    },
    musicBrainzUrl && {
      icon: <Brain />,
      label: 'MusicBrainz',
      url: musicBrainzUrl,
    },
  ].filter(v => !!v);

  const wrapper = <nav className="flex flex-wrap gap-2" />;

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
              className="inline-block space-x-2 whitespace-nowrap"
              href={link.url}
              rel="noopener"
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
