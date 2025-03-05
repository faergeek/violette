type options

external [@mel.obj] options :
  current:string -> queued:string array option -> options = ""

external [@mel.module "./startPlaying"] make :
  options -> (unit, unit, Deps.t) Fx.t = "startPlaying"
