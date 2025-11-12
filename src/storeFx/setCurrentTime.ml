open DomExtra
open Fx
open Monad_syntax

let make currentTime =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  PlayerContext.skipping := true;
  let currentTime =
    Js.Math.max_float 0.0
      (Js.Math.min_float
         (currentTime state.player.currentTime)
         (state.player.duration |> Option.value ~default:infinity))
  in
  if currentTime == HtmlAudioElement.currentTime PlayerContext.audio then Ok ()
  else
    Async
      (fun _ ->
        PlayerContext.audio |. HtmlAudioElement.setCurrentTime currentTime;
        store
        |. Zustand.setState (fun prevState ->
            { prevState with player = { prevState.player with currentTime } });
        store |> SaveCurrentTime.now
        |> Js.Promise.then_ (fun () -> Ok () |> Js.Promise.resolve)
        |> Js.Promise.catch (fun _ -> Error () |> Js.Promise.resolve))
