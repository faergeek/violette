import { getRouteApi, Link, Outlet } from '@tanstack/react-router';
import { CassetteTape, LogOut } from 'lucide-react';

import { Button } from '../_core/button';
import { Container } from '../_core/container';
import { Footer } from '../_core/footer';
import { NowPlaying } from '../_core/nowPlaying';
import { useStoreMutations } from '../store/react';

export function Layout() {
  const routeApi = getRouteApi('/_layout');
  const { credentials } = routeApi.useLoaderData();
  const mutations = useStoreMutations();

  return (
    <div className="relative flex min-h-lvh flex-col">
      <Container className="flex-1">
        <header className="flex items-center gap-4 py-4">
          <Link className="flex items-center gap-2" to="/">
            <CassetteTape />
            Player
          </Link>

          <form
            className="ms-auto"
            onSubmit={event => {
              event.preventDefault();
              mutations.clearSubsonicCredentials();
            }}
          >
            <Button variant="link" type="submit">
              Logout
              <LogOut />
            </Button>
          </form>
        </header>

        <main>
          <Outlet />
        </main>
      </Container>

      <Footer />

      <div className="sticky bottom-0 isolate transform-gpu touch-none overflow-hidden bg-background">
        <NowPlaying credentials={credentials} />
      </div>
    </div>
  );
}
