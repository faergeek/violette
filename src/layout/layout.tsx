import { getRouteApi, Link, Outlet } from '@tanstack/react-router';
import { CassetteTape } from 'lucide-react';

import { Button } from '../_core/button';
import { Container } from '../_core/container';
import { Player } from '../_core/player';
import { useStoreMutations } from '../store/react';

export function Layout() {
  const routeApi = getRouteApi('/_layout');
  const { credentials } = routeApi.useLoaderData();
  const mutations = useStoreMutations();

  return (
    <div className="relative flex min-h-lvh flex-col">
      <Container className="flex-1 pb-8">
        <header className="flex items-center gap-4 py-4">
          <Link className="flex items-center gap-2" to="/">
            <CassetteTape />
            Player
          </Link>

          <Button
            className="ms-auto"
            onClick={() => {
              mutations.clearSubsonicCredentials();
            }}
          >
            Logout
          </Button>
        </header>

        <main>
          <Outlet />
        </main>
      </Container>

      <div className="sticky bottom-0 bg-background">
        <Player credentials={credentials} />
      </div>
    </div>
  );
}
