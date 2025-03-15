open Ppx_deriving_json_runtime.Primitives

type[@deriving json] album = {
  artist : string;
  artistId : string;
  coverArt : string;
  discTitles : DiscTitle.t array option; [@json.option]
  duration : float option; [@json.option]
  genre : string option; [@json.option]
  genres : Genre.t array option; [@json.option]
  id : string;
  isCompilation : bool option; [@json.option]
  musicBrainzId : string option; [@json.option]
  name : string;
  originalReleaseDate : ReleaseDate.t option; [@json.option]
  releaseDate : ReleaseDate.t option; [@json.option]
  song : Song.t array;
  songCount : int;
  starred : string option; [@json.option]
  userRating : int option; [@json.option]
  year : int option; [@json.option]
}

type[@deriving json] body = { status : [ `ok ]; album : album }
type[@deriving json] t = body Response.t
