open Fx
open Monad_syntax

type state = {
  current : string option;
  currentTime : float;
  queued : string array;
}

let make playQueueState =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  let playQueueState =
    playQueueState
      {
        current = state.player.currentSongId;
        currentTime = state.player.currentTime;
        queued = state.player.queuedSongIds;
      }
  in
  if not (Router.deepEqual playQueueState.queued state.player.queuedSongIds)
  then
    store
    |. Zustand.setState (fun prevState ->
        {
          prevState with
          player =
            { prevState.player with queuedSongIds = playQueueState.queued };
        });
  Subsonic.SavePlayQueue.make playQueueState.queued
    ?current:
      (state.player.currentSongId |> Belt.Option.orElse playQueueState.current)
    ~position:playQueueState.currentTime ()
  |. provide ~deps:{ credentials = state.auth.credentials }
  |. catch (fun _ -> Error ())
