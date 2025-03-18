open Ppx_deriving_json_runtime.Primitives

type[@deriving json] basic = { name : string }
type[@deriving json] t = Artist of BaseArtist.t | BasicInfo of basic

let of_json =
  Json.Decode.oneOf
    [
      (fun json -> Artist (BaseArtist.of_json json));
      (fun json -> BasicInfo (basic_of_json json));
    ]

let to_json _ = failwith "Not supported"
