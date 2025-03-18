open Ppx_deriving_json_runtime.Primitives

type[@deriving json] body = { status : [ `ok ] }
type[@deriving json] t = body Response.t
