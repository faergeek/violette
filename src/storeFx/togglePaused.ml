open Fx
open Monad_syntax

let make () =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  if not state.player.paused then Pause.make () else Play.make ()
