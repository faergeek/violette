open Ppx_deriving_json_runtime.Primitives

type[@deriving json] indexItem = { artist : BaseArtist.t array; name : string }
type[@deriving json] artists = { index : indexItem array }
type[@deriving json] body = { status : [ `ok ]; artists : artists }
type[@deriving json] t = body Response.t
