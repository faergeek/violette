external [@mel.module "./fetchOneSong"] make :
  string -> (unit, Subsonic.error, Deps.t) Fx.t = "fetchOneSong"
