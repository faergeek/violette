open Ppx_deriving_json_runtime.Primitives

type[@deriving json] body = { status : [ `failed ]; error : ApiError.t }
type[@deriving json] t = body Response.t
