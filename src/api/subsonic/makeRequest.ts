import * as v from 'valibot';

import { Fx } from '../../_core/fx';
import type { SubsonicRequest } from './buildSubsonicApiUrl';
import { buildSubsonicApiUrl } from './buildSubsonicApiUrl';
import type { SubsonicCredentials } from './types/credentials';

const SubsonicResponseJsonCommon = v.object({
  openSubsonic: v.optional(v.boolean()),
  serverVersion: v.optional(v.string()),
  type: v.optional(v.string()),
  version: v.string(),
});

const SubsonicResponseJsonOk = v.object({
  ...SubsonicResponseJsonCommon.entries,
  status: v.literal('ok'),
});

type SubsonicResponseJsonOk = v.InferInput<typeof SubsonicResponseJsonOk>;

const SubsonicResponseJsonFailed = v.object({
  ...SubsonicResponseJsonCommon.entries,
  status: v.literal('failed'),
  error: v.object({
    code: v.number(),
    message: v.string(),
  }),
});

type SubsonicResponseJsonFailed = v.InferInput<
  typeof SubsonicResponseJsonFailed
>;

export type SubsonicError =
  | { type: 'no-credentials' }
  | { type: 'network-error'; error: unknown }
  | { type: 'request-failed'; status: number; statusText: string }
  | { type: 'non-json-content-type'; actual: string | null }
  | { type: 'api-error'; code: number; message: string }
  | { type: 'validation-failed'; issues: unknown };

export const makeSubsonicRequest = Fx.async(async function* f(
  subsonicRequest: SubsonicRequest,
) {
  const { credentials } = yield* Fx.ask<{
    credentials: SubsonicCredentials | undefined;
  }>();

  if (!credentials) return Fx.Err({ type: 'no-credentials' });

  const request = buildSubsonicApiUrl(credentials, subsonicRequest);

  try {
    const response = await fetch(request);

    return response.ok
      ? Fx.Ok(response)
      : Fx.Err<SubsonicError>({
          type: 'request-failed',
          status: response.status,
          statusText: response.statusText,
        });
  } catch (error) {
    return Fx.Err<SubsonicError>({ type: 'network-error', error });
  }
});

export const parseJsonResponse = Fx.async(async function* f<
  T extends v.ObjectEntries,
>(response: Response, entries: T) {
  const contentTypeHeader = response.headers.get('content-type');

  const actualContentType =
    contentTypeHeader && contentTypeHeader?.indexOf(';') !== -1
      ? contentTypeHeader.slice(0, contentTypeHeader.indexOf(';'))
      : contentTypeHeader;

  if (actualContentType !== 'application/json') {
    yield* Fx.Err<SubsonicError>({
      type: 'non-json-content-type',
      actual: actualContentType,
    });
  }

  const json = await response.json();

  const result = v.safeParse(
    v.object({
      'subsonic-response': v.union([
        v.object({
          ...SubsonicResponseJsonOk.entries,
          ...entries,
        }),
        SubsonicResponseJsonFailed,
      ]),
    }),
    json,
  );

  return result.success === true
    ? Fx.Ok(result.output)
    : Fx.Err({ type: 'validation-failed', issues: result.issues });
});

export function handleJsonResponse<T extends SubsonicResponseJsonOk>(
  response: T | SubsonicResponseJsonFailed,
): Fx<T, SubsonicError, unknown> {
  return response.status === 'failed'
    ? Fx.Err({
        type: 'api-error',
        code: response.error.code,
        message: response.error.message,
      })
    : Fx.Ok(response);
}
