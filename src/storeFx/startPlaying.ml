open Fx
open Monad_syntax

let make ~current ?queued () =
  let* Deps.{ store } = ask () in
  store
  |. Zustand.setState (fun prevState ->
      {
        prevState with
        player = { prevState.player with currentSongId = Some current };
      });
  let* () = Play.make () in
  UpdatePlayQueue.make (fun prevState ->
      {
        prevState with
        queued =
          (let state = store |. Zustand.getState in
           queued |> Option.value ~default:state.player.queuedSongIds);
      })
  |. catch (fun _ -> Error ())
