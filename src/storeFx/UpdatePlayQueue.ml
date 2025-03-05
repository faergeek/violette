type state = {
  current : string option;
  currentTime : float;
  queued : string array;
}

external [@mel.module "./updatePlayQueue"] make :
  (state -> state) -> (unit, unit, Deps.t) Fx.t = "updatePlayQueue"
