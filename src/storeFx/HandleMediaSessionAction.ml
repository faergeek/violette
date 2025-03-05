external [@mel.module "./handleMediaSessionAction"] make :
  MediaSession.actionDetails -> (unit, unit, Deps.t) Fx.t
  = "handleMediaSessionAction"
