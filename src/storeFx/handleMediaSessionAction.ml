open Fx
open MediaSession

let make event =
  match event.action with
  | `play -> Play.make ()
  | `pause -> Pause.make ()
  | `stop -> StopPlaying.make ()
  | `seekto -> (
      match event.seekTime with
      | None -> Ok ()
      | Some seekTime -> SetCurrentTime.make (Fun.const seekTime))
  | `seekforward -> (
      match event.seekOffset with
      | None -> Ok ()
      | Some seekOffset ->
          SetCurrentTime.make (fun currentTime -> currentTime +. seekOffset))
  | `seekbackward -> (
      match event.seekOffset with
      | None -> Ok ()
      | Some seekOffset ->
          SetCurrentTime.make (fun currentTime -> currentTime -. seekOffset))
  | `previoustrack -> GoToPrevSong.make ()
  | `nexttrack -> GoToNextSong.make ()
