open Fx
open Monad_syntax
open Utils

let make () =
  let* { response = { status = `ok; artists } } =
    let params = Js.Dict.empty () in
    makeRequest { _method = "rest/getArtists"; params } Artists.of_json
  in
  Ok artists
