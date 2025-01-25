import { SiGithub } from '@icons-pack/react-simple-icons';

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mt-10 border-t">
        <footer className="container mx-auto flex flex-wrap items-center justify-center gap-2 whitespace-nowrap p-4 text-center text-muted-foreground">
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
            className="flex items-center gap-2"
            href="https://github.com/faergeek/violette"
            rel="noopener"
            target="_blank"
          >
            <SiGithub className="size-5" /> GitHub
          </a>
        </footer>
      </div>
    </footer>
  );
}
