type t
type options

external [@mel.obj] options : ?replace:bool -> _to:string -> unit -> options
  = ""

external [@mel.module "@tanstack/react-router"] make : options -> t = "redirect"
