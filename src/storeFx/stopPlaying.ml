open Fx
open Monad_syntax

let make () =
  let* () = Pause.make () in
  SetCurrentTime.make (fun _ -> 0.0)
