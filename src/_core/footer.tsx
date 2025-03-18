import { SiGithub } from '@icons-pack/react-simple-icons';
import { Link } from '@tanstack/react-router';

import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="container mx-auto mt-auto">
      <hr className="mx-4 mt-10 border-t" />

      <div className="flex flex-wrap items-center justify-between gap-2 whitespace-nowrap px-4 py-6 text-center text-muted-foreground">
        <Link className="flex items-center gap-2" to="/">
          <Logo className="size-5" />
          Violette
        </Link>

        <span>
          <a
            href="https://github.com/faergeek/violette/blob/master/LICENSE"
            rel="noopener"
            target="_blank"
          >
            Copyright &copy; 2025
          </a>
          <span aria-hidden className="text-primary">
            {' '}
            &bull;{' '}
          </span>
          <address className="inline not-italic">
            <a
              href="https://github.com/faergeek"
              rel="noopener"
              target="_blank"
            >
              Sergei Slipchenko
            </a>
          </address>
        </span>

        <a
          className="flex items-center gap-2"
          href="https://github.com/faergeek/violette"
          rel="noopener"
          target="_blank"
        >
          GitHub <SiGithub className="size-5" />
        </a>
      </div>
    </footer>
  );
}
