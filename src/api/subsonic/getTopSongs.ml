open Fx
open Monad_syntax
open Utils

let make artistName ?count () =
  let* { response = { status = `ok; topSongs = { song } } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "artist" (Value artistName);
    count
    |> Option.iter (fun count ->
           Js.Dict.set params "count" (Value (Int.to_string count)));
    makeRequest { _method = "rest/getTopSongs"; params } TopSongs.of_json
  in
  Ok song
