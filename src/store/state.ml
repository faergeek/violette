type albums = {
  baseById : (string, Subsonic.BaseAlbum.t) Js.Map.t;
  detailsById : (string, Subsonic.AlbumDetails.t) Js.Map.t;
  infoById : (string, Subsonic.AlbumInfo.albumInfo) Js.Map.t;
  songIdsById : (string, string array) Js.Map.t;
}

type artists = {
  albumIdsByArtistId : (string, string array) Js.Map.t;
  artistInfoById : (string, Subsonic.ArtistInfo.withoutSimilarArtist) Js.Map.t;
  byId : (string, Subsonic.BaseArtist.t) Js.Map.t;
  listIds : string array option;
  similarArtistsById : (string, Subsonic.SimilarArtist.t array) Js.Map.t;
  topSongIdsByArtistName : (string, string array) Js.Map.t;
}

type auth = {
  clearSubsonicCredentials : unit -> unit;
  credentials : Subsonic.Credentials.t option;
  saveSubsonicCredentials : Subsonic.Credentials.t -> unit;
}

module ReplayGainOptions = struct
  open Ppx_deriving_json_runtime.Primitives

  type[@deriving json] preferredGain = [ `album | `track ]

  let stringOfPreferredGain = function `album -> "album" | `track -> "track"

  let preferredGainOfString = function
    | "album" -> Some `album
    | "track" -> Some `track
    | _ -> None

  type[@deriving json] t = {
    preAmp : float;
    preferredGain : preferredGain option; [@json.option]
  }
end

type timeRange = { end_ : float; [@mel.as "end"] start : float }

type player = {
  buffered : timeRange Js.Array.t;
  currentSongId : string option;
  currentTime : float;
  duration : float option;
  muted : bool;
  paused : bool;
  queuedSongIds : string Js.Array.t;
  replayGainOptions : ReplayGainOptions.t;
  volume : float;
}

type songs = { byId : (string, Subsonic.Song.t) Js.Map.t }

type t = {
  albums : albums;
  artists : artists;
  auth : auth;
  player : player;
  songs : songs;
}
