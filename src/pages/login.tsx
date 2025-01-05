import { CassetteTape, KeyRound } from 'lucide-react';
import { useActionState } from 'react';
import SparkMD5 from 'spark-md5';
import invariant from 'tiny-invariant';
import * as v from 'valibot';

import { Button } from '../_core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../_core/card';
import { Container } from '../_core/container';
import { Footer } from '../_core/footer';
import { Fx } from '../_core/fx';
import { Input } from '../_core/input';
import { Label } from '../_core/label';
import { SubsonicApiError } from '../_core/subsonicApiError';
import { subsonicPing } from '../api/subsonic';
import type { SubsonicCredentials, SubsonicError } from '../api/types';
import { useStoreMutations, useStoreState } from '../store/react';
import type { StoreMutations } from '../store/types';

const loginFormSchema = v.object({
  serverBaseUrl: v.string(),
  username: v.string(),
  password: v.string(),
});

const loginFx = Fx.async(async function* f() {
  yield* subsonicPing();

  const { credentials, mutations } = yield* Fx.ask<{
    credentials: SubsonicCredentials;
    mutations: StoreMutations;
  }>();

  mutations.saveSubsonicCredentials(credentials);
  return Fx.Ok(null);
});

export function Login() {
  const mutations = useStoreMutations();

  const [error, loginAction, isLoginSubmitting] = useActionState<
    SubsonicError | null,
    FormData
  >(async (_previousState, formData) => {
    const { password, serverBaseUrl, username } = v.parse(loginFormSchema, {
      password: formData.get('password'),
      serverBaseUrl: formData.get('server-base-url'),
      username: formData.get('username'),
    });

    const salt = Array.from(crypto.getRandomValues(new Uint8Array(3)))
      .map(b => b.toString(16))
      .join('');

    return loginFx()
      .runAsync({
        credentials: {
          salt,
          serverBaseUrl,
          token: SparkMD5.hash(password + salt),
          username,
        },
        mutations,
      })
      .then(result => result.match({ Err: err => err, Ok: value => value }));
  }, null);

  const credentials = useStoreState(state => state.credentials);

  return (
    <div className="flex min-h-lvh flex-col">
      <Container className="max-w-96 flex-1">
        <header className="flex items-center justify-center gap-2 py-4">
          <CassetteTape />
          Player
        </header>

        <Card
          action={loginAction}
          aria-describedby="login-form-description"
          aria-labelledby="login-form-heading"
          as="form"
        >
          <CardHeader>
            <CardTitle id="login-form-heading">Login</CardTitle>

            <CardDescription id="login-form-description">
              Enter your server details or{' '}
              <button
                className="text-foreground hover:text-primary"
                type="button"
                onClick={event => {
                  const form = event.currentTarget.form;
                  invariant(form);

                  const input = (name: string) => {
                    const result = form.elements.namedItem(name);
                    invariant(result instanceof HTMLInputElement);
                    return result;
                  };

                  input('server-base-url').value = 'https://demo.navidrome.org';
                  input('username').value = 'demo';
                  input('password').value = 'demo';
                  form.requestSubmit();
                }}
              >
                try a demo
              </button>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label className="pb-2" htmlFor="login-server-base-url">
                URL:
              </Label>

              <Input
                autoFocus
                defaultValue={credentials?.serverBaseUrl ?? undefined}
                disabled={isLoginSubmitting}
                id="login-server-base-url"
                name="server-base-url"
                required
                type="url"
              />
            </div>

            <div>
              <Label className="pb-2" htmlFor="login-username">
                Username:
              </Label>

              <Input
                autoComplete="username"
                defaultValue={credentials?.username ?? undefined}
                disabled={isLoginSubmitting}
                id="login-username"
                name="username"
                required
              />
            </div>

            <div>
              <Label className="pb-2" htmlFor="login-password">
                Password:
              </Label>

              <Input
                autoComplete="current-password"
                disabled={isLoginSubmitting}
                id="login-password"
                name="password"
                required
                type="password"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              disabled={isLoginSubmitting}
              loading={isLoginSubmitting}
              type="submit"
            >
              <KeyRound aria-hidden />
              Login
            </Button>

            {error && <SubsonicApiError className="mt-4" error={error} />}
          </CardFooter>
        </Card>
      </Container>

      <Footer />
    </div>
  );
}
