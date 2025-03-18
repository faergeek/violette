open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  albumCount : int;
  coverArt : string;
  id : string;
  musicBrainzId : string option; [@json.option]
  name : string;
  starred : string option; [@json.option]
  userRating : int option; [@json.option]
}
