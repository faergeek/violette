import {
  SiLastdotfm,
  SiLastdotfmHex,
  SiMusicbrainz,
  SiMusicbrainzHex,
} from '@icons-pack/react-simple-icons';
import { cloneElement } from 'react';

import css from './mediaLinks.module.css';

export function MediaLinks({
  lastFmUrl,
  musicBrainzUrl,
  skeleton,
}: {
  lastFmUrl?: string;
  musicBrainzUrl?: string;
  skeleton?: boolean;
}) {
  const links: Array<{
    color: string;
    icon: React.ReactElement<{
      'aria-hidden': boolean;
      className: string;
    }>;
    label: string;
    url: string;
  }> = [];

  if (lastFmUrl) {
    links.push({
      color: SiLastdotfmHex,
      icon: <SiLastdotfm />,
      label: 'Last.fm',
      url: lastFmUrl,
    });
  }

  if (musicBrainzUrl) {
    links.push({
      color: SiMusicbrainzHex,
      icon: <SiMusicbrainz />,
      label: 'MusicBrainz',
      url: musicBrainzUrl,
    });
  }

  if (skeleton || links.length === 0) {
    return null;
  }

  return (
    <nav className={css.root}>
      {links.map(link => (
        <a
          key={link.url}
          className={css.item}
          href={link.url}
          rel="noopener"
          style={{
            ['--brand-color' as string]: link.color,
          }}
          target="_blank"
        >
          {cloneElement(link.icon, {
            'aria-hidden': true,
            className: css.icon,
          })}

          {link.label}
        </a>
      ))}
    </nav>
  );
}
