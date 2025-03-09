type t

external [@mel.set] setValue : t -> float -> unit = "value"

external [@mel.send] setValueAtTime : t -> float -> float -> unit
  = "setValueAtTime"
