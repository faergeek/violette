open Fx
open Monad_syntax
open Utils

let make id ?current ?(position = 0.0) () =
  let* { response = { status = `ok } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Array id);
    current
    |> Option.iter (fun current -> Js.Dict.set params "current" (Value current));
    Js.Dict.set params "position" (Value (position |> Js.Float.toString));
    makeRequest { _method = "rest/savePlayQueue"; params } Empty.of_json
  in
  Ok ()
