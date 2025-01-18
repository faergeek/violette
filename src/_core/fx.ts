import { Result } from '@faergeek/monads';

import { resultAll } from './result';

const OK = 'Ok';
type OK = typeof OK;

const ERR = 'Err';
type ERR = typeof ERR;

const SYNC = 'Sync';
type SYNC = typeof SYNC;

const ASYNC = 'Async';
type ASYNC = typeof ASYNC;

const GET_ENV = Symbol();
type GET_ENV = typeof GET_ENV;

export class Fx<T = never, E = never, R = unknown> {
  #v;

  private constructor(
    value:
      | { tag: OK; value: T }
      | { tag: ERR; err: E }
      | { tag: SYNC; f: (env: R) => Fx<T, E, R> }
      | { tag: ASYNC; f: (env: R) => Promise<Fx<T, E, R>> },
  ) {
    this.#v = value;
  }

  static of = Fx.Ok;

  static Ok(): Fx<void>;
  static Ok<T = never>(value: T): Fx<T>;
  static Ok<T = never>(value?: T) {
    return new Fx({ tag: OK, value });
  }

  static Err<const E = never>(err: E) {
    return new Fx<never, E>({ tag: ERR, err });
  }

  static Sync<T, E, R>(f: (env: R) => Fx<T, E, R>) {
    return new Fx<T, E, R>({ tag: SYNC, f });
  }

  static Async<T, E, R>(f: (env: R) => Promise<Fx<T, E, R>>) {
    return new Fx<T, E, R>({ tag: ASYNC, f });
  }

  static ask<R>() {
    return Fx.Sync<R, never, R>(Fx.Ok);
  }

  provide(env: R): Fx<T, E, unknown> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return Fx.Ok(v.value);
      case ERR:
        return Fx.Err(v.err);
      case SYNC:
        return Fx.Sync<T, E, unknown>(() => v.f(env).provide(env));
      case ASYNC:
        return Fx.Async<T, E, unknown>(() =>
          v.f(env).then(fx => fx.provide(env)),
        );
    }
  }

  flatMap<U, F>(f: (value: T) => Fx<U, F, R>): Fx<U, E | F, R> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return f(v.value);
      case ERR:
        return Fx.Err(v.err);
      case SYNC:
        return Fx.Sync<U, E | F, R>(env => v.f(env).flatMap(f));
      case ASYNC:
        return Fx.Async<U, E | F, R>(env =>
          v.f(env).then(result => result.flatMap(f)),
        );
    }
  }

  catch<U, F>(f: (err: E) => Fx<U, F, R>): Fx<T | U, F, R> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return Fx.Ok(v.value);
      case ERR:
        return f(v.err);
      case SYNC:
        return Fx.Sync<T | U, F, R>(env => v.f(env).catch(f));
      case ASYNC:
        return Fx.Async<T | U, F, R>(env =>
          v.f(env).then(result => result.catch(f)),
        );
    }
  }

  static sync<T, E, R, A extends unknown[]>(
    f: (...args: A) => Generator<E | GET_ENV, Fx<T, E, R>, R>,
  ) {
    return (...args: A) =>
      Fx.Sync<T, E, R>(env => {
        const gen = f(...args);

        let result = gen.next();
        while (!result.done) {
          if (result.value === GET_ENV) {
            result = gen.next(env);
          } else {
            result = gen.return(Fx.Err(result.value));
          }
        }

        return result.value;
      });
  }

  *[Symbol.iterator](): Generator<E | GET_ENV, T, R> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return v.value;
      case ERR:
        yield v.err;
        throw v.err;
      case SYNC:
        return yield* v.f(yield GET_ENV);
      case ASYNC:
        throw new Error('Cannot use async fx as a sync iterator');
    }
  }

  run(env: R): Result<T, E> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return Result.Ok(v.value);
      case ERR:
        return Result.Err(v.err);
      case SYNC:
        return v.f(env).run(env);
      case ASYNC:
        throw new Error('Cannot run async fx synchronously');
    }
  }

  static async<T, E, R, A extends unknown[]>(
    f: (...args: A) => AsyncGenerator<E | GET_ENV, Fx<T, E, R>, R>,
  ) {
    return (...args: A) =>
      Fx.Async<T, E, R>(async env => {
        const gen = f(...args);

        let result = await gen.next();
        while (!result.done) {
          if (result.value === GET_ENV) {
            result = await gen.next(env);
          } else {
            result = await gen.return(Fx.Err(result.value));
          }
        }

        return result.value;
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static asyncAll<T extends ReadonlyArray<Fx<unknown, unknown, any>> | []>(
    xs: T,
  ) {
    type Intersect<XS extends readonly unknown[] | []> = XS extends [
      Fx<unknown, unknown, infer X0>,
      ...infer NextXS,
    ]
      ? X0 & Intersect<NextXS>
      : unknown;

    return Fx.Async(async (env: Intersect<T>) => {
      const results = await Promise.all(xs.map(x => x.runAsync(env)));

      return resultAll(results).match({
        Err: err =>
          Fx.Err(
            err as {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              -readonly [I in keyof T]: T[I] extends Fx<unknown, infer F, any>
                ? F
                : never;
            }[number],
          ),
        Ok: value =>
          Fx.Ok(
            value as {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              -readonly [I in keyof T]: T[I] extends Fx<infer U, unknown, any>
                ? U
                : never;
            },
          ),
      });
    });
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<E | GET_ENV, T, R> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return v.value;
      case ERR:
        yield v.err;
        throw v.err;
      case SYNC:
        return yield* v.f(yield GET_ENV);
      case ASYNC:
        return yield* await v.f(yield GET_ENV);
    }
  }

  async runAsync(env: R): Promise<Result<T, E>> {
    const v = this.#v;

    switch (v.tag) {
      case OK:
        return Promise.resolve(Result.Ok(v.value));
      case ERR:
        return Promise.resolve(Result.Err(v.err));
      case SYNC:
        return v.f(env).runAsync(env);
      case ASYNC: {
        const fx = await v.f(env);
        return fx.runAsync(env);
      }
    }
  }
}
