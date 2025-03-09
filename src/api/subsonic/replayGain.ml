open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  albumGain : float option; [@json.option]
  albumPeak : float option; [@json.option]
  trackGain : float option; [@json.option]
  trackPeak : float option; [@json.option]
}
