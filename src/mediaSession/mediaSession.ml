type action =
  [ `nexttrack
  | `pause
  | `play
  | `previoustrack
  | `seekbackward
  | `seekforward
  | `seekto
  | `stop ]

type actionDetails = {
  action : action;
  fastSeek : bool option;
  seekOffset : float option;
  seekTime : float option;
}

external [@mel.scope "navigator", "mediaSession"] setActionHandler :
  action -> handler:(actionDetails -> unit) option -> unit = "setActionHandler"

type positionState

external [@mel.obj] positionState :
  duration:float -> position:float -> positionState = ""

external [@mel.scope "navigator", "mediaSession"] setPositionState :
  positionState -> unit = "setPositionState"

module Metadata = struct
  type t

  external [@mel.new] make : unit -> t = "MediaMetadata"
  external [@mel.set] setAlbum : t -> string -> unit = "album"
  external [@mel.set] setArtist : t -> string -> unit = "artist"
  external [@mel.set] setTitle : t -> string -> unit = "title"

  type artwork = { sizes : string; src : string }

  external [@mel.set] setArtwork : t -> artwork array -> unit = "artwork"
end

external [@mel.scope "mediaSession"] [@mel.set] setMetadata :
  Webapi.Dom.Window.navigator -> Metadata.t -> unit = "metadata"
