open Fx
open Monad_syntax
open Utils

let make id =
  let* { response = { status = `ok; album } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getAlbum"; params } Album.of_json
  in
  Ok album
