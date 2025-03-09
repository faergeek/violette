import { Result } from '@faergeek/monads';

export function resultAll<T extends readonly unknown[] | []>(
  xs: T,
): Result<
  {
    -readonly [I in keyof T]: T[I] extends Result<infer U, unknown> ? U : never;
  },
  {
    -readonly [K in keyof T]: T[K] extends Result<unknown, infer F> ? F : never;
  }[keyof T]
>;
export function resultAll<T, E>(xs: Array<Result<T, E>>): Result<T[], E>;
export function resultAll<T, E>(xs: Array<Result<T, E>>) {
  let result: Result<T[], E> = Result.Ok([]);

  let isOk = true;
  for (let i = 0; isOk && i < xs.length; i++) {
    result = Result.all({ result, x: xs[i] }).mapOk(a => a.result.concat(a.x));

    isOk = result.match({ Err: () => false, Ok: () => true });
  }

  return result;
}
