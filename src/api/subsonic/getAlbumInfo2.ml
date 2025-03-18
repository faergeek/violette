open Fx
open Monad_syntax
open Utils

let make id =
  let* { response = { status = `ok; albumInfo } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getAlbumInfo2"; params } AlbumInfo.of_json
  in
  Ok albumInfo
