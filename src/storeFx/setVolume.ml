open Fx
open Monad_syntax

let make (volume : float -> float) : (unit, unit, Deps.t) Fx.t =
  let* Deps.{ store } = ask () in
  store
  |. Zustand.setState (fun prevState ->
         {
           prevState with
           player =
             {
               prevState.player with
               volume =
                 Js.Math.max_float 0.0
                   (Js.Math.min_float (volume prevState.player.volume) 1.0);
             };
         });
  !PlayerContext.value
  |> Option.iter (fun PlayerContext.{ volumeNode; _ } ->
         let open WebAudio in
         let state = store |. Zustand.getState in
         volumeNode |. AudioNode.gain |. AudioParam.setValue state.player.volume);
  Ok ()
