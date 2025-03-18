type t
type options

external [@mel.obj] options :
  ?replace:bool -> ?search:'a Js.t -> _to:string -> unit -> options = ""

external [@mel.module "@tanstack/react-router"] make : options -> t = "redirect"
