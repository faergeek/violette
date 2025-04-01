open Ppx_deriving_json_runtime.Primitives

type[@deriving json] artist = {
  album : BaseAlbum.t array option; [@json.option]
  albumCount : int;
  coverArt : string;
  id : string;
  musicBrainzId : string option; [@json.option]
  name : string;
  starred : string option; [@json.option]
  userRating : int option; [@json.option]
}

type[@deriving json] body = { status : [ `ok ]; artist : artist }
type[@deriving json] t = body Response.t
