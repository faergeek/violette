open Fx
open Monad_syntax

let make () : (unit, unit, Deps.t) Fx.t =
  let* Deps.{ store } = ask () in
  store
  |. Zustand.setState (fun prevState ->
      {
        prevState with
        player =
          {
            prevState.player with
            muted =
              not (prevState.player.muted || prevState.player.volume == 0.0);
            volume =
              (if
                 (prevState.player.muted && prevState.player.volume == 0.0)
                 || prevState.player.volume == 0.0
               then 0.5
               else prevState.player.volume);
          };
      });
  Ok
    (!PlayerContext.value
    |> Option.iter (fun PlayerContext.{ volumeNode; _ } ->
        let open WebAudio in
        let state = store |. Zustand.getState in
        volumeNode |. AudioNode.gain
        |. AudioParam.setValue
             (if state.player.muted then 0.0 else state.player.volume)))
