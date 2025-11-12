open Utils

let makeUrl ~credentials ~coverArt ?size () =
  let open Webapi in
  let params = Js.Dict.empty () in
  Js.Dict.set params "id" (Value coverArt);
  size
  |> Option.iter (fun size ->
      Js.Dict.set params "size" (Value (Int.to_string size)));
  buildSubsonicApiUrl credentials { _method = "rest/getCoverArt"; params }
  |> Url.href
