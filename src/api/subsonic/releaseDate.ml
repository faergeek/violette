open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  day : int option; [@json.option]
  month : int option; [@json.option]
  year : int option; [@json.option]
}
