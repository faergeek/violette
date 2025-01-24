import { Link, Outlet } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';

import { Button } from '../_core/button';
import { Container } from '../_core/container';
import { Footer } from '../_core/footer';
import { Logo } from '../_core/logo';
import { NowPlaying } from '../_core/nowPlaying';
import { useAppStore } from '../store/react';

export function Layout() {
  const clearSubsonicCredentials = useAppStore(
    state => state.auth.clearSubsonicCredentials,
  );

  return (
    <div className="relative flex min-h-lvh flex-col">
      <Container className="flex-1">
        <header className="flex items-center gap-4 py-4">
          <Link className="flex items-center gap-2" to="/">
            <Logo className="size-8" />
            <strong aria-hidden>Violette</strong>
          </Link>

          <form
            className="ms-auto"
            onSubmit={event => {
              event.preventDefault();
              clearSubsonicCredentials();
            }}
          >
            <Button variant="link" type="submit">
              Logout
              <LogOut role="none" />
            </Button>
          </form>
        </header>

        <main>
          <Outlet />
        </main>
      </Container>

      <Footer />
      <NowPlaying />
    </div>
  );
}
