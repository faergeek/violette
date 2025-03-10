open Fx
open Monad_syntax

let make () =
  let* Deps.{ store } = Fx.ask () in
  let state = store |. Zustand.getState in
  let queued = state.player.queuedSongIds in
  let len = queued |> Js.Array.length
  and currentIndex =
    state.player.currentSongId
    |> Option.map (fun value -> queued |> Js.Array.indexOf ~value)
    |> Option.value ~default:0
  in
  let current = queued |. Belt.Array.getUnsafe ((currentIndex + 1) mod len) in
  StartPlaying.make ~current ()
