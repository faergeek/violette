open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  discTitles : DiscTitle.t array option; [@json.option]
  isCompilation : bool option; [@json.option]
  originalReleaseDate : ReleaseDate.t option; [@json.option]
  releaseDate : ReleaseDate.t option; [@json.option]
}
