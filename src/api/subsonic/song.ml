open Ppx_deriving_json_runtime.Primitives

type[@deriving json] t = {
  album : string;
  albumId : string;
  artist : string;
  artistId : string option; [@json.option]
  coverArt : string;
  discNumber : int option; [@json.option]
  duration : float;
  genre : string option; [@json.option]
  genres : Genre.t array option; [@json.option]
  id : string;
  musicBrainzId : string option; [@json.option]
  replayGain : ReplayGain.t option; [@json.option]
  size : float;
  starred : string option; [@json.option]
  title : string;
  track : int option; [@json.option]
  userRating : float option; [@json.option]
  year : int option; [@json.option]
}
