import { KeyRoundIcon } from 'lucide-react';
import { useState } from 'react';
import SparkMd5 from 'spark-md5';

import * as Fx from '../fx/fx';
import { Button } from '../shared/button';
import { Footer } from '../shared/footer';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { Logo } from '../shared/logo';
import { useAppStore } from '../store/context.jsx';
import type { SubsonicRequestError } from '../subsonic';
import { ping } from '../subsonic';
import css from './loginPage.module.css';

export function LoginPage() {
  const saveSubsonicCredentials = useAppStore(
    state => state.auth.saveSubsonicCredentials,
  );

  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [loginResult, setLoginResult] = useState<
    Fx.Result<void, SubsonicRequestError>
  >({ TAG: 0, _0: undefined });

  const credentials = useAppStore(state => state.auth.credentials);

  let errorMessage: string | undefined;
  if (loginResult.TAG === 1) {
    const error = loginResult._0;
    switch (error.kind) {
      case 'network-error':
        return 'Network error occurred. Please check your network connection';
      case 'request-failed':
        errorMessage = `${error.status}: ${error.statusText}`;
        break;
      case 'api-error':
        errorMessage = error.message;
        break;
      default:
        errorMessage = 'Unexpected API response';
    }
  }

  return (
    <div className={css.root}>
      <main className={css.inner}>
        <form
          aria-describedby="login-form-description"
          aria-labelledby="login-form-heading"
          className={css.form}
          onSubmit={event => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            setIsLoginSubmitting(true);

            function input(name: string) {
              const v = formData.get(name);
              if (typeof v !== 'string') throw new Error('Expected a string');
              return v;
            }

            const salt = Array.from(crypto.getRandomValues(new Uint8Array(10)))
              .map(b => b.toString(16))
              .join('');

            const newCredentials = {
              salt,
              serverBaseUrl: input('server-base-url'),
              token: SparkMd5.hash(input('password') + salt, false),
              username: input('username'),
            };

            return Fx.runAsync(
              Fx.map(ping(), () => {
                saveSubsonicCredentials(newCredentials);
              }),
              { credentials: newCredentials },
            ).then(result => {
              setLoginResult(result);
              if (result.TAG !== 0) setIsLoginSubmitting(false);
            });
          }}
        >
          <div className={css.header}>
            <div className={css.logo}>
              <Logo className={css.logoSvg} />
              <strong aria-hidden>Violette</strong>
            </div>

            <div className={css.description} id="login-form-description">
              Enter your server details or{' '}
              <button
                className={css.demoLink}
                type="button"
                onClick={event => {
                  const form = event.currentTarget.form;
                  if (!form) throw new Error();

                  const input = (name: string) => {
                    const el = form.elements.namedItem(name);
                    if (!(el instanceof HTMLInputElement)) throw new Error();
                    return el;
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

          <div className={css.fields}>
            <div>
              <Label className={css.label} htmlFor="login-server-base-url">
                URL:
              </Label>

              <Input
                autoFocus
                defaultValue={credentials?.serverBaseUrl ?? ''}
                disabled={isLoginSubmitting}
                id="login-server-base-url"
                name="server-base-url"
                required
                type="url"
              />
            </div>

            <div>
              <Label className={css.label} htmlFor="login-username">
                Username:
              </Label>

              <Input
                autoComplete="username"
                defaultValue={credentials?.username}
                disabled={isLoginSubmitting}
                id="login-username"
                name="username"
                required
              />
            </div>

            <div>
              <Label className={css.label} htmlFor="login-password">
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

          <div className={css.submitButtonWrapper}>
            <Button
              disabled={isLoginSubmitting}
              loading={isLoginSubmitting}
              type="submit"
            >
              <KeyRoundIcon aria-hidden />
              Login
            </Button>

            {errorMessage && (
              <p className={css.submitError} role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
