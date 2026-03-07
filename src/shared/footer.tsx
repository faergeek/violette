import { SiGithub } from '@icons-pack/react-simple-icons';
import { Link } from '@tanstack/react-router';

import { Container } from './container';
import css from './footer.module.css';
import { Logo } from './logo';

export function Footer() {
  return (
    <Container className={css.root}>
      <hr className={css.hr} />

      <div className={css.content}>
        <Link className={css.logoWrapper} to="/">
          <Logo className={css.logo} />
          Violette
        </Link>

        <address className={css.address}>
          <a
            href="https://github.com/faergeek/violette/blob/main/LICENSE"
            rel="noopener"
            target="_blank"
          >
            Copyright © 2025
          </a>

          <span aria-hidden className={css.dot}>
            {' • '}
          </span>

          <span>
            <a
              href="https://github.com/faergeek"
              rel="noopener"
              target="_blank"
            >
              Sergei Slipchenko
            </a>
          </span>
        </address>

        <a
          className={css.logoWrapper}
          href="https://github.com/faergeek/violette"
          rel="noopener"
          target="_blank"
        >
          GitHub <SiGithub className={css.logo} />
        </a>
      </div>
    </Container>
  );
}
