open Utils
open Webapi

let make credentials id =
  let params = Js.Dict.empty () in
  Js.Dict.set params "id" (Value id);
  buildSubsonicApiUrl credentials { _method = "rest/stream"; params }
  |> Url.href
