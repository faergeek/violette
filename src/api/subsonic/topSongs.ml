open Ppx_deriving_json_runtime.Primitives

type[@deriving json] topSongs = { song : Song.t array option [@json.option] }
type[@deriving json] body = { status : [ `ok ]; topSongs : topSongs }
type[@deriving json] t = body Response.t
