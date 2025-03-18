type t

external [@mel.new] make : unit -> t = "AudioContext"
external [@mel.send] createGain : t -> AudioNode.t = "createGain"

external [@mel.send] createMediaElementSource :
  t -> Dom.htmlAudioElement -> AudioNode.t = "createMediaElementSource"

external [@mel.get] currentTime : t -> float = "currentTime"
external [@mel.get] destination : t -> AudioNode.t = "destination"
