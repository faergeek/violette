open Fx
open Monad_syntax
open Utils

module Response = struct
  open Ppx_deriving_json_runtime.Primitives

  type[@deriving json] playQueue = {
    changed : string;
    changedBy : string;
    current : string option; [@json.option]
    entry : Song.t array;
    position : float option; [@json.option]
    username : string;
  }

  type[@deriving json] body = { status : [ `ok ]; playQueue : playQueue option }
  type[@deriving json] t = body Response.t
end

let make () =
  let* { response = { status = `ok; playQueue } } =
    let params = Js.Dict.empty () in
    makeRequest { _method = "rest/getPlayQueue"; params } Response.of_json
  in
  Ok playQueue
