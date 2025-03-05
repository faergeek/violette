open Ppx_deriving_json_runtime.Primitives

type[@deriving json] 'a response = {
  response : 'a; [@json.key "subsonic-response"]
}

type[@deriving json] error = { code : int; message : string }
type[@deriving json] failedBody = { status : [ `failed ]; error : error }
type[@deriving json] failed = failedBody response

module Genre = struct
  type[@deriving json] t = { name : string }
end

module BaseAlbum = struct
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
end

module BaseArtist = struct
  type[@deriving json] t = {
    albumCount : int;
    coverArt : string;
    id : string;
    musicBrainzId : string option; [@json.option]
    name : string;
    starred : string option; [@json.option]
    userRating : int option; [@json.option]
  }
end

module Empty = struct
  type[@deriving json] body = { status : [ `ok ] }
  type[@deriving json] t = body response
end

module ReplayGain = struct
  type[@deriving json] t = {
    albumGain : float option; [@json.option]
    albumPeak : float option; [@json.option]
    trackGain : float option; [@json.option]
    trackPeak : float option; [@json.option]
  }
end

module Song = struct
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
end

module DiscTitle = struct
  type[@deriving json] t = { disc : int; title : string }
end

module ReleaseDate = struct
  type[@deriving json] t = {
    day : int option; [@json.option]
    month : int option; [@json.option]
    year : int option; [@json.option]
  }
end

module Album = struct
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
  type[@deriving json] t = body response
end

module AlbumInfo = struct
  type[@deriving json] albumInfo = {
    lastFmUrl : string option; [@json.option]
    musicBrainzId : string option; [@json.option]
    notes : string option; [@json.option]
  }

  type[@deriving json] body = { status : [ `ok ]; albumInfo : albumInfo }
  type[@deriving json] t = body response
end

module AlbumDetails = struct
  type[@deriving json] t = {
    discTitles : DiscTitle.t array option; [@json.option]
    isCompilation : bool option; [@json.option]
    originalReleaseDate : ReleaseDate.t option; [@json.option]
    releaseDate : ReleaseDate.t option; [@json.option]
  }
end

module Artists = struct
  type[@deriving json] indexItem = {
    artist : BaseArtist.t array;
    name : string;
  }

  type[@deriving json] artists = { index : indexItem array }
  type[@deriving json] body = { status : [ `ok ]; artists : artists }
  type[@deriving json] t = body response
end

module Artist = struct
  type[@deriving json] artist = {
    album : BaseAlbum.t array;
    albumCount : int;
    coverArt : string;
    id : string;
    musicBrainzId : string option; [@json.option]
    name : string;
    starred : string option; [@json.option]
    userRating : int option; [@json.option]
  }

  type[@deriving json] body = { status : [ `ok ]; artist : artist }
  type[@deriving json] t = body response
end

module SimilarArtist = struct
  type[@deriving json] basic = { name : string }
  type[@deriving json] t = Artist of BaseArtist.t | BasicInfo of basic

  let of_json =
    Json.Decode.oneOf
      [
        (fun json -> Artist (BaseArtist.of_json json));
        (fun json -> BasicInfo (basic_of_json json));
      ]

  let to_json _ = failwith "Not supported"
end

module ArtistInfo = struct
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
  type[@deriving json] t = body response
end

module TopSongs = struct
  type[@deriving json] topSongs = { song : Song.t array option [@json.option] }
  type[@deriving json] body = { status : [ `ok ]; topSongs : topSongs }
  type[@deriving json] t = body response
end
