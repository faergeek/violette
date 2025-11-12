open Fx
open Monad_syntax

let make () =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  match state.auth.credentials with
  | None -> Ok ()
  | Some credentials ->
      let* playQueue =
        Subsonic.GetPlayQueue.make ()
        |. provide ~deps:{ credentials = Some credentials }
        |. catch (fun error ->
            match error with
            | ApiError { code; _ } when code == 70 -> Ok None
            | error -> Error error)
      in
      let open Subsonic.GetPlayQueue.Response in
      let currentSongId = playQueue |. Option.bind (fun x -> x.current) in
      currentSongId
      |> Option.iter (fun _ ->
          SetCurrentTime.make (fun _ ->
              (playQueue
              |. Option.bind (fun x -> x.position)
              |> Option.value ~default:0.0)
              /. 1000.0)
          |. runAsync ~deps:{ store }
          |> ignore);
      Ok
        (store
        |. Zustand.setState (fun prevState ->
            {
              prevState with
              player =
                {
                  prevState.player with
                  currentSongId;
                  queuedSongIds =
                    playQueue
                    |> Option.map (fun x ->
                        x.entry
                        |. Js.Array.map ~f:(fun song -> Subsonic.Song.(song.id)))
                    |> Option.value ~default:[||];
                };
              songs =
                {
                  byId =
                    (let state = store |. Zustand.getState in
                     match playQueue |> Option.map (fun x -> x.entry) with
                     | Some entry ->
                         MergeIntoMap.mergeIntoMap state.songs.byId entry
                           (fun x -> x.id)
                     | None -> state.songs.byId);
                };
            }))
