const OK = 0;
const ERROR = 1;
const SYNC = 2;
const ASYNC = 3;

export type Fx<Ok, Err, Deps> =
  | { TAG: typeof OK; _0: Ok }
  | { TAG: typeof ERROR; _0: Err }
  | { TAG: typeof SYNC; _0: (deps: Deps) => Fx<Ok, Err, Deps> }
  | { TAG: typeof ASYNC; _0: (deps: Deps) => Promise<Fx<Ok, Err, Deps>> };

export function Ok<Ok>(value: Ok): Fx<Ok, never, unknown>;
export function Ok(): Fx<void, never, unknown>;
export function Ok(value?: unknown) {
  return { TAG: OK, _0: value };
}

export function Err<const Err>(err: Err): Fx<never, Err, unknown> {
  return { TAG: ERROR, _0: err };
}

export function Sync<Ok, Err, Deps>(
  f: (deps: Deps) => Fx<Ok, Err, Deps>,
): Fx<Ok, Err, Deps> {
  return { TAG: SYNC, _0: f };
}

export function Async<Ok, Err, Deps>(
  f: (deps: Deps) => Promise<Fx<Ok, Err, Deps>>,
): Fx<Ok, Err, Deps> {
  return { TAG: ASYNC, _0: f };
}

export function ask<Deps>() {
  return Sync<Deps, never, Deps>(deps => Ok(deps));
}

export function provide<Ok, Err, Deps>(
  fx: Fx<Ok, Err, Deps>,
  deps: Deps,
): Fx<Ok, Err, unknown> {
  switch (fx.TAG) {
    case OK:
      return fx;
    case ERROR:
      return fx;
    case SYNC:
      return Sync(() => provide(fx._0(deps), deps));
    case ASYNC:
      return Async(() => fx._0(deps).then(fx1 => provide(fx1, deps)));
  }
}

export function bind<Ok, Ok2, Err, Deps>(
  fx: Fx<Ok, Err, Deps>,
  cb: (value: Ok) => Fx<Ok2, Err, Deps>,
): Fx<Ok2, Err, Deps> {
  switch (fx.TAG) {
    case OK:
      return cb(fx._0);
    case ERROR:
      return fx;
    case SYNC:
      return Sync(deps => bind(fx._0(deps), cb));
    case ASYNC:
      return Async(deps => fx._0(deps).then(result => bind(result, cb)));
  }
}

export function catch_<Ok, Err, Err2, Deps>(
  fx: Fx<Ok, Err, Deps>,
  cb: (err: Err) => Fx<Ok, Err2, Deps>,
): Fx<Ok, Err2, Deps> {
  switch (fx.TAG) {
    case OK:
      return fx;
    case ERROR:
      return cb(fx._0);
    case SYNC:
      return Sync(deps => catch_(fx._0(deps), cb));
    case ASYNC:
      return Async(deps => fx._0(deps).then(result => catch_(result, cb)));
  }
}

export function map<Ok, Ok2, Err, Deps>(
  fx: Fx<Ok, Err, Deps>,
  f: (value: Ok) => Ok2,
) {
  return bind(fx, value => Ok(f(value)));
}

export type Result<Ok, Err> =
  | { TAG: typeof OK; _0: Ok }
  | { TAG: typeof ERROR; _0: Err };

export function run<Ok, Err, Deps>(
  fx: Fx<Ok, Err, Deps>,
  deps: Deps,
): Result<Ok, Err> {
  switch (fx.TAG) {
    case OK:
      return { TAG: OK, _0: fx._0 };
    case ERROR:
      return { TAG: ERROR, _0: fx._0 };
    case SYNC:
      return run(fx._0(deps), deps);
    case ASYNC:
      throw new Error('Cannot run async fx synchronously');
  }
}

export async function runAsync<Ok, Err, Deps>(
  fx: Fx<Ok, Err, Deps>,
  deps: Deps,
): Promise<Result<Ok, Err>> {
  switch (fx.TAG) {
    case OK:
      return { TAG: OK, _0: fx._0 };
    case ERROR:
      return { TAG: ERROR, _0: fx._0 };
    case SYNC:
      return runAsync(fx._0(deps), deps);
    case ASYNC:
      return fx._0(deps).then(fx1 => runAsync(fx1, deps));
  }
}
