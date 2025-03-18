open Fx
open Monad_syntax
open Utils

let make id ?submission ?time () =
  let* { response = { status = `ok } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    submission
    |> Option.iter (fun submission ->
           Js.Dict.set params "submission"
             (Value (submission |> Bool.to_string)));
    time
    |> Option.iter (fun time ->
           Js.Dict.set params "time" (Value (time |> Js.Float.toString)));
    makeRequest { _method = "rest/scrobble"; params } Empty.of_json
  in
  Ok ()
