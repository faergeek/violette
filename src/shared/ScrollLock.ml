type lockScroll = bool -> unit

external [@mel.module "./useScrollLock"] use : unit -> lockScroll
  = "useScrollLock"
