external [@mel.module "./setReplayGainOptions"] make :
  (Store.State.ReplayGainOptions.t -> Store.State.ReplayGainOptions.t) ->
  (unit, unit, Deps.t) Fx.t = "setReplayGainOptions"
