import { SiGithub } from '@icons-pack/react-simple-icons';

import { Container } from './container';
import { Separator } from './separator';

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-2 mt-10">
        <Separator />
      </div>

      <Container>
        <footer className="flex flex-wrap items-center justify-center gap-2 whitespace-nowrap py-6 text-center text-muted-foreground">
          <a
            href="https://github.com/faergeek/violette/blob/master/LICENSE"
            rel="noopener"
            target="_blank"
          >
            Copyright &copy; 2025
          </a>
          <address className="not-italic">
            <a
              href="https://github.com/faergeek"
              rel="noopener"
              target="_blank"
            >
              Sergei Slipchenko
            </a>
          </address>
          <a
            className="group flex items-center gap-2"
            href="https://github.com/faergeek/violette"
            rel="noopener"
            target="_blank"
          >
            <SiGithub className="size-4" /> GitHub
          </a>
        </footer>
      </Container>
    </footer>
  );
}
