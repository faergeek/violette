open Fx
open Monad_syntax
open Utils

let make () =
  let* { response = { status = `ok } } =
    let params = Js.Dict.empty () in
    makeRequest { _method = "rest/ping"; params } Empty.of_json
  in
  Ok ()
