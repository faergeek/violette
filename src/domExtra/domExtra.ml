type listenerOptions

external [@mel.obj] listenerOptions :
  ?capture:bool ->
  ?passive:bool ->
  ?signal:Fetch.signal ->
  unit ->
  listenerOptions = ""

module TimeRanges = struct
  type t

  external [@mel.get] length : t -> int = "length"
  external [@mel.send] start : t -> int -> float = "start"
  external [@mel.send] end_ : t -> int -> float = "end"
end

module HtmlAudioElement = struct
  external [@mel.set] setCrossOrigin :
    Dom.htmlAudioElement -> [ `anonymous ] -> unit = "crossOrigin"

  external [@mel.get] currentTime : Dom.htmlAudioElement -> float
    = "currentTime"

  external [@mel.get] buffered : Dom.htmlAudioElement -> TimeRanges.t
    = "buffered"

  external [@mel.get] duration : Dom.htmlAudioElement -> float = "duration"
  external [@mel.new] make : unit -> Dom.htmlAudioElement = "Audio"
  external [@mel.get] muted : Dom.htmlAudioElement -> bool = "muted"
  external [@mel.send] pause : Dom.htmlAudioElement -> unit = "pause"
  external [@mel.get] paused : Dom.htmlAudioElement -> bool = "paused"
  external [@mel.send] play : Dom.htmlAudioElement -> unit Js.Promise.t = "play"
  external [@mel.get] src : Dom.htmlAudioElement -> string = "src"
  external [@mel.get] volume : Dom.htmlAudioElement -> float = "volume"

  external [@mel.set] setCurrentTime : Dom.htmlAudioElement -> float -> unit
    = "currentTime"

  external [@mel.set] setSrc : Dom.htmlAudioElement -> string -> unit = "src"
end

module BeforeToggle = struct
  type _t
  type t = _t Dom.uiEvent_like

  external [@mel.get] newState : t -> string = "newState"
  external [@mel.send] preventDefault : t -> unit = "preventDefault"
end

module DurationChange = struct
  type _t
  type t = _t Dom.uiEvent_like
end

module Emptied = struct
  type _t
  type t = _t Dom.uiEvent_like
end

module Ended = struct
  type _t
  type t = _t Dom.uiEvent_like
end

module Pause = struct
  type _t
  type t = _t Dom.uiEvent_like
end

module Play = struct
  type _t
  type t = _t Dom.uiEvent_like
end

module TimeUpdate = struct
  type _t
  type t = _t Dom.uiEvent_like
end

module Toggle = struct
  type _t
  type t = _t Dom.uiEvent_like

  external [@mel.get] newState : t -> string = "newState"
  external [@mel.send] preventDefault : t -> unit = "preventDefault"
end

external [@mel.send] addEventListener :
  'a Dom.element_like ->
  ([ `beforetoggle of BeforeToggle.t -> unit
   | `durationchange of DurationChange.t -> unit
   | `emptied of Ended.t -> unit
   | `ended of Ended.t -> unit
   | `pause of Pause.t -> unit
   | `play of Play.t -> unit
   | `timeupdate of TimeUpdate.t -> unit
   | `toggle of Toggle.t -> unit ]
  [@mel.string]) ->
  listenerOptions ->
  unit = "addEventListener"

external [@mel.get] role : Dom.htmlElement -> string = "role"
