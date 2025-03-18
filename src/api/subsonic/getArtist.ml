open Fx
open Monad_syntax
open Utils

let make id =
  let* { response = { status = `ok; artist } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getArtist"; params } Artist.of_json
  in
  Ok artist
