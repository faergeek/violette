open Dom.Storage
open Fx
open Monad_syntax
open Store.State

let make newReplayGainOptions =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  let newReplayGainOptions =
    state.player.replayGainOptions |> newReplayGainOptions
  in
  let newReplayGainOptions =
    ReplayGainOptions.
      {
        newReplayGainOptions with
        preAmp =
          Js.Math.max_float (-15.0)
            (Js.Math.min_float newReplayGainOptions.preAmp 15.0);
      }
  in
  store
  |. Zustand.setState (fun prevState ->
      {
        prevState with
        player =
          { prevState.player with replayGainOptions = newReplayGainOptions };
      });
  Ok
    (newReplayGainOptions |> Js.Json.stringifyAny
    |> Option.iter (fun value ->
        localStorage |> setItem Store.Player.replay_gain_local_storage_key value)
    )
