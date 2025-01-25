import { invariant } from '@tanstack/react-router';
import { KeyRound } from 'lucide-react';
import { useActionState } from 'react';
import * as v from 'valibot';

import { Button } from '../_core/button';
import { Footer } from '../_core/footer';
import { Fx } from '../_core/fx';
import { Input } from '../_core/input';
import { Label } from '../_core/label';
import { Logo } from '../_core/logo';
import type { SubsonicError } from '../api/subsonic/makeRequest';
import { subsonicPing } from '../api/subsonic/methods/ping';
import type { SubsonicCredentials } from '../api/subsonic/types/credentials';
import { useAppStore } from '../store/react';

const loginFormSchema = v.object({
  serverBaseUrl: v.string(),
  username: v.string(),
  password: v.string(),
});

const loginFx = Fx.async(async function* f(
  saveSubsonicCredentials: (credentials: SubsonicCredentials) => void,
) {
  yield* subsonicPing();

  const { credentials } = yield* Fx.ask<{ credentials: SubsonicCredentials }>();

  saveSubsonicCredentials(credentials);
  return Fx.Ok(null);
});

export function LoginPage() {
  const saveSubsonicCredentials = useAppStore(
    state => state.auth.saveSubsonicCredentials,
  );

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

    return loginFx(saveSubsonicCredentials)
      .runAsync({
        credentials: {
          salt,
          serverBaseUrl,
          token: (await import('spark-md5')).default.hash(password + salt),
          username,
        },
      })
      .then(result => result.match({ Err: err => err, Ok: value => value }));
  }, null);

  const credentials = useAppStore(state => state.auth.credentials);

  return (
    <div className="flex min-h-lvh flex-col">
      <header className="flex items-center justify-center gap-2 py-4">
        <Logo className="size-8" />
        <strong aria-hidden>Violette</strong>
      </header>

      <main className="mx-auto w-full max-w-96 flex-1">
        <form
          action={loginAction}
          aria-describedby="login-form-description"
          aria-labelledby="login-form-heading"
          className="space-y-4 px-4"
        >
          <div className="flex flex-col space-y-1.5">
            <h1
              className="text-2xl font-bold leading-none tracking-tight"
              id="login-form-heading"
            >
              Login
            </h1>

            <div
              className="text-sm text-muted-foreground"
              id="login-form-description"
            >
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
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="pb-1" htmlFor="login-server-base-url">
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
              <Label className="pb-1" htmlFor="login-username">
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
              <Label className="pb-1" htmlFor="login-password">
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
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={isLoginSubmitting}
              loading={isLoginSubmitting}
              type="submit"
            >
              <KeyRound aria-hidden />
              Login
            </Button>

            {error && (
              <p className="text-destructive" role="alert">
                {error.type === 'api-error'
                  ? error.message
                  : error.type === 'request-failed'
                    ? `${error.status}: ${error.statusText}`
                    : error.type === 'network-error'
                      ? 'Network error occurred. Please check your network connection'
                      : 'Unexpected API response'}
              </p>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
