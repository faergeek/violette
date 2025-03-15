[%%mel.raw "import { Result } from '@faergeek/monads'"]

[%%mel.raw
{js|
export class FxInternal {
  constructor(value) {
    this.value = value;
  }
}
|js}]

type ('v, 'e, 'd) t =
  | Ok of 'v
  | Error of 'e
  | Sync of ('d -> ('v, 'e, 'd) t)
  | Async of ('d -> ('v, 'e, 'd) t Js.promise)

type ('v, 'e, 'd) input

external [@mel.module "./fx"] [@mel.new] make :
  ('v, 'e, 'd) input -> ('v, 'e, 'd) t = "FxInternal"

external [@mel.obj] okInput :
  tag:(_[@mel.as "Ok"]) -> value:'v -> ('v, 'e, 'd) input = ""

let ok value = okInput ~value |> make

external [@mel.obj] errInput :
  tag:(_[@mel.as "Err"]) -> err:'e -> ('v, 'e, 'd) input = ""

let err err = errInput ~err |> make

external [@mel.obj] syncInput :
  tag:(_[@mel.as "Sync"]) -> f:('d -> ('v, 'e, 'd) t) -> ('v, 'e, 'd) input = ""

let sync f = syncInput ~f |> make

external [@mel.obj] asyncInput :
  tag:(_[@mel.as "Async"]) ->
  f:('d -> ('v, 'e, 'd) t Js.promise) ->
  ('v, 'e, 'd) input = ""

let async f = asyncInput ~f |> make
let ask () = sync ok

let provide : ('v, 'e, 'r) t -> 'r -> ('v, 'e, 'a) t =
  [%mel.raw
    {js|
      function provide(fx, env) {
        const v = fx.value;

        switch (v.tag) {
          case "Ok":
            return ok(v.value);
          case "Err":
            return err(v.err);
          case "Sync":
            return sync(() => provide(v.f(env), env));
          case "Async":
            return async(() => v.f(env).then(fx => provide(fx, env)));
        }
      }
    |js}]

let bind : ('v, 'e, 'd) t -> ('v -> ('b, 'e, 'd) t) -> ('b, 'e, 'd) t =
  [%mel.raw
    {js|
      function bind(fx, f) {
        const v = fx.value;

        switch (v.tag) {
          case "Ok":
            return f(v.value);
          case "Err":
            return err(v.err);
          case "Sync":
            return sync(env => bind(v.f(env), f));
          case "Async":
            return async(env => v.f(env).then(result => bind(result, f)));
        }
      }
    |js}]

let catch : ('v, 'e, 'd) t -> ('e -> ('v, 'f, 'd) t) -> ('v, 'f, 'd) t =
  [%mel.raw
    {js|
      function catch_(fx, f) {
        const v = fx.value;

        switch (v.tag) {
          case "Ok":
            return ok(v.value);
          case "Err":
            return f(v.err);
          case "Sync":
            return sync(env => catch_(v.f(env), f));
          case "Async":
            return async(env => v.f(env).then(result => catch_(result, f)));
        }
      }
    |js}]

let map : ('a, 'e, 'd) t -> ('a -> 'b) -> ('b, 'e, 'd) t =
  [%mel.raw
    {js|
      function(fx, f) {
        return bind(fx, value => ok(f(value)));
      }
    |js}]

let run : ('v, 'e, 'd) t -> deps:'d -> ('v, 'e) Monads.Result.t =
  [%mel.raw
    {js|
      function run(fx, env) {
        const v = fx.value;

        switch (v.tag) {
          case "Ok":
            return Result.Ok(v.value);
          case "Err":
            return Result.Err(v.err);
          case "Sync":
            return run(v.f(env), env);
          case "Async":
            throw new Error('Cannot run async fx synchronously');
        }
      }
    |js}]

[%%mel.raw
{js|
FxInternal.prototype.runAsync = async function runAsync(env) {
  const v = this.value;

  switch (v.tag) {
    case "Ok":
      return Promise.resolve(Result.Ok(v.value));
    case "Err":
      return Promise.resolve(Result.Err(v.err));
    case "Sync":
      return v.f(env).runAsync(env);
    case "Async": {
      const fx = await v.f(env);
      return fx.runAsync(env);
    }
  }
}
|js}]

external [@mel.send] runAsync :
  ('v, 'e, 'd) t -> deps:'d -> ('v, 'e) Monads.Result.t Js.promise = "runAsync"

module Monad_syntax = struct
  let ( let* ) = bind
end
