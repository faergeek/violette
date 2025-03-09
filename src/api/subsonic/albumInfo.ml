open Ppx_deriving_json_runtime.Primitives

type[@deriving json] albumInfo = {
  lastFmUrl : string option; [@json.option]
  musicBrainzId : string option; [@json.option]
  notes : string option; [@json.option]
}

type[@deriving json] body = { status : [ `ok ]; albumInfo : albumInfo }
type[@deriving json] t = body Response.t
