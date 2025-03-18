open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = { disc : int; title : string }
