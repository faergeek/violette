open Fx
open Monad_syntax

let make () =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  if state.player.currentTime > 3.0 then
    let* () = SetCurrentTime.make (Fun.const 0.0) in
    Play.make ()
  else
    let queued = state.player.queuedSongIds in
    let len = queued |> Js.Array.length
    and currentIndex =
      state.player.currentSongId
      |> Option.map (fun value -> queued |> Js.Array.indexOf ~value)
      |> Option.value ~default:0
    in
    let current =
      queued |. Belt.Array.getUnsafe ((len + currentIndex - 1) mod len)
    in
    StartPlaying.make ~current ()
