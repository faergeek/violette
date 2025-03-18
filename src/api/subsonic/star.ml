open Fx
open Monad_syntax
open Utils

let make StarParams.{ albumId; artistId; id } =
  let* { response = { status = `ok } } =
    let params = Js.Dict.empty () in
    albumId
    |> Option.iter (fun albumId -> Js.Dict.set params "albumId" (Value albumId));
    artistId
    |> Option.iter (fun artistId ->
           Js.Dict.set params "artistId" (Value artistId));
    id |> Option.iter (fun id -> Js.Dict.set params "id" (Value id));
    makeRequest { _method = "rest/star"; params } Empty.of_json
  in
  Ok ()
