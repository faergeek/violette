type t

external [@mel.send] connect : t -> t -> t = "connect"
external [@mel.get] gain : t -> AudioParam.t = "gain"
