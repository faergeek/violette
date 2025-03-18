open Ppx_deriving_json_runtime.Primitives

type[@deriving json] withoutSimilarArtist = {
  biography : string option; [@json.option]
  lastFmUrl : string option; [@json.option]
  musicBrainzId : string option; [@json.option]
}

type[@deriving json] info = {
  biography : string option; [@json.option]
  lastFmUrl : string option; [@json.option]
  musicBrainzId : string option; [@json.option]
  similarArtist : SimilarArtist.t array option; [@json.option]
}

type[@deriving json] body = { status : [ `ok ]; artistInfo2 : info }
type[@deriving json] t = body Response.t
