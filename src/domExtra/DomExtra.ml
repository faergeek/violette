type listenerOptions

external [@mel.obj] listenerOptions :
  ?capture:bool ->
  ?passive:bool ->
  ?signal:Fetch.signal ->
  unit ->
  listenerOptions = ""

module BeforeToggle = struct
  type _t
  type t = _t Dom.uiEvent_like

  external [@mel.get] newState : t -> string = "newState"
  external [@mel.send] preventDefault : t -> unit = "preventDefault"
end

module Toggle = struct
  type _t
  type t = _t Dom.uiEvent_like

  external [@mel.get] newState : t -> string = "newState"
  external [@mel.send] preventDefault : t -> unit = "preventDefault"
end

external [@mel.send] addEventListener :
  Dom.element ->
  ([ `toggle of Toggle.t -> unit | `beforetoggle of BeforeToggle.t -> unit ]
  [@mel.string]) ->
  listenerOptions ->
  unit = "addEventListener"

external [@mel.get] role : Dom.htmlElement -> string = "role"
