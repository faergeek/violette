open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  artist : string;
  artistId : string;
  coverArt : string;
  duration : float option; [@json.option]
  genre : string option; [@json.option]
  genres : Genre.t array option; [@json.option]
  id : string;
  musicBrainzId : string option; [@json.option]
  name : string;
  songCount : int;
  starred : string option; [@json.option]
  userRating : int option; [@json.option]
  year : int option; [@json.option]
}
