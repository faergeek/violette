open Fx
open Monad_syntax
open Ppx_deriving_json_runtime.Primitives
open Utils

type[@deriving json] body = { status : [ `ok ]; song : Song.t }
type[@deriving json] response = body Response.t

let make id =
  let* { response = { status = `ok; song } } =
    let params = Js.Dict.empty () in
    Js.Dict.set params "id" (Value id);
    makeRequest { _method = "rest/getSong"; params } response_of_json
  in
  Ok song
