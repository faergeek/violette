type location = { hash : string }
type t = { location : location }
type options

external [@mel.obj] options : select:(t -> 'a) -> options = ""

external [@mel.module "@tanstack/react-router"] use : options -> 'a
  = "useRouterState"
