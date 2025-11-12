type ('a, 'b, 'c) t =
  | Ok of 'a
  | Error of 'b
  | Sync of ('c -> ('a, 'b, 'c) t)
  | Async of ('c -> ('a, 'b, 'c) t Js.Promise.t)

let ask () = Sync (fun value -> Ok value)

let rec provide fx ~deps =
  match fx with
  | Ok value -> Ok value
  | Error error -> Error error
  | Sync f -> Sync (fun _ -> provide (f deps) ~deps)
  | Async f ->
      Async
        (fun _ ->
          f deps
          |> Js.Promise.then_ (fun fx -> provide fx ~deps |> Js.Promise.resolve))

let rec bind fx cb =
  match fx with
  | Ok value -> cb value
  | Error error -> Error error
  | Sync f -> Sync (fun deps -> bind (f deps) cb)
  | Async f ->
      Async
        (fun deps ->
          f deps
          |> Js.Promise.then_ (fun result ->
                 bind result cb |> Js.Promise.resolve))

let rec catch fx cb =
  match fx with
  | Ok value -> Ok value
  | Error error -> cb error
  | Sync f -> Sync (fun deps -> catch (f deps) cb)
  | Async f ->
      Async
        (fun deps ->
          f deps
          |> Js.Promise.then_ (fun result ->
                 catch result cb |> Js.Promise.resolve))

let map fx f = bind fx (fun value -> Ok (f value))

let rec run fx ~deps =
  match fx with
  | Ok value -> Result.Ok value
  | Error err -> Result.Error err
  | Sync f -> run (f deps) ~deps
  | Async _ -> failwith "Cannot run async fx synchronously"

let rec runAsync fx ~deps =
  match fx with
  | Ok value -> Result.Ok value |> Js.Promise.resolve
  | Error err -> Result.Error err |> Js.Promise.resolve
  | Sync f -> runAsync (f deps) ~deps
  | Async f -> f deps |> Js.Promise.then_ (fun fx -> runAsync fx ~deps)

module Monad_syntax = struct
  let ( let* ) = bind
end
