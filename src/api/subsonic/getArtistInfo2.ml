open Fx
open Monad_syntax
open Utils

let make id ?count ?includeNotPresent () =
  let* { response = { status = `ok; artistInfo2 } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    count
    |> Option.iter (fun count ->
           Js.Dict.set params "count" (Value (Int.to_string count)));
    includeNotPresent
    |> Option.iter (fun includeNotPresent ->
           Js.Dict.set params "includeNotPresent"
             (Value (Bool.to_string includeNotPresent)));
    makeRequest { _method = "rest/getArtistInfo2"; params } ArtistInfo.of_json
  in
  Ok artistInfo2
