external [@mel.new] make : unit -> Webapi.Dom.Image.t = "Image"
external [@mel.set] setSizes : Webapi.Dom.Image.t -> string -> unit = "sizes"
external [@mel.set] setSrcSet : Webapi.Dom.Image.t -> string -> unit = "srcset"
external [@mel.get] complete : Dom.element -> bool = "complete"

external [@mel.get] currentSrc : Dom.element -> string Js.Nullable.t
  = "currentSrc"
