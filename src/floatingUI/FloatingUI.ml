type middleware

module AutoUpdate = struct
  type dispose = unit -> unit

  external [@mel.module "@floating-ui/dom"] make :
    reference:Dom.element ->
    floating:Dom.element ->
    update:((unit -> unit)[@mel.uncurry]) ->
    dispose = "autoUpdate"
end

module ComputePosition = struct
  type t = { x : float; y : float }
  type options

  external [@mel.obj] options :
    ?middleware:middleware array ->
    ?placement:
      [ `topEnd [@mel.as "top-end"] | `bottomEnd [@mel.as "bottom-end"] ] ->
    ?strategy:[ `absolute | `fixed ] ->
    unit ->
    options = ""

  external [@mel.module "@floating-ui/dom"] make :
    reference:Dom.element ->
    floating:Dom.element ->
    options:options ->
    t Js.Promise.t = "computePosition"
end

module Flip = struct
  type options

  external [@mel.obj] options : ?padding:float -> unit -> options = ""

  external [@mel.module "@floating-ui/dom"] make : options -> middleware
    = "flip"
end

module Offset = struct
  type options

  external [@mel.obj] options : ?mainAxis:float -> unit -> options = ""

  external [@mel.module "@floating-ui/dom"] make : options -> middleware
    = "offset"
end

module Shift = struct
  type options

  external [@mel.obj] options : ?padding:float -> unit -> options = ""

  external [@mel.module "@floating-ui/dom"] make : options -> middleware
    = "shift"
end

module Size = struct
  type options
  type elements = { floating : Dom.element }

  type input = {
    availableWidth : float;
    availableHeight : float;
    elements : elements;
  }

  external [@mel.obj] options : ?apply:(input -> unit) -> unit -> options = ""

  external [@mel.module "@floating-ui/dom"] make : options -> middleware
    = "size"
end
