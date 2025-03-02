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
