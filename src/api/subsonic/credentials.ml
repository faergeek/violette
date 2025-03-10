open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  salt : string;
  serverBaseUrl : string;
  token : string;
  username : string;
}
